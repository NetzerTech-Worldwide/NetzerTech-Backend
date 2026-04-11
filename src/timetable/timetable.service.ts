import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User, Student, Class, LiveSession } from '../entities';
import { DailyTimetableDto, TimetableEventDto } from './dto/timetable.dto';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class TimetableService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Class)
        private classRepository: Repository<Class>,
        @InjectRepository(LiveSession)
        private liveSessionRepository: Repository<LiveSession>,
    ) { }

    async getDailySchedule(userId: string, dateString?: string): Promise<DailyTimetableDto> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['student'],
        });

        if (!user || !user.student) {
            throw new NotFoundException('Student profile not found');
        }

        const studentId = user.student.id;
        const targetDate = dateString ? new Date(dateString) : new Date();

        // Set exact boundaries for the day to query existing records. 
        // Usually, classic "Classes" recur weekly, but we will mock them mapping onto the targetDate to serve demo payload

        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const now = new Date();

        // 1. Fetch Student registered conventional Classes (these run weekly)
        const classes = await this.classRepository
            .createQueryBuilder('class')
            .leftJoinAndSelect('class.teacher', 'teacher')
            .leftJoin('class.students', 'student')
            .where('student.id = :studentId', { studentId })
            .andWhere('class.isActive = :isActive', { isActive: true })
            .getMany();

        // 2. Fetch standard isolated LiveSessions
        const liveSessions = await this.liveSessionRepository
            .createQueryBuilder('session')
            .leftJoinAndSelect('session.class', 'class')
            .leftJoinAndSelect('class.teacher', 'teacher')
            .leftJoin('session.participants', 'student')
            .where('student.id = :studentId', { studentId })
            .andWhere('session.startTime >= :startOfDay', { startOfDay })
            .andWhere('session.startTime <= :endOfDay', { endOfDay })
            .getMany();

        const events: TimetableEventDto[] = [];

        // Map conventional classes (Mocking them onto the target day for demo consistency)
        classes.forEach(cls => {
            // Create a cloned date block attached to exactly the target day, but keeping DB class hours
            const localStartTime = new Date(targetDate);
            localStartTime.setHours(cls.startTime ? cls.startTime.getHours() : 9, cls.startTime ? cls.startTime.getMinutes() : 0, 0);

            const localEndTime = new Date(targetDate);
            localEndTime.setHours(cls.endTime ? cls.endTime.getHours() : 10, cls.endTime ? cls.endTime.getMinutes() : 0, 0);

            let status: 'upcoming' | 'ongoing' | 'completed' = 'upcoming';
            if (now > localEndTime) status = 'completed';
            else if (now >= localStartTime && now <= localEndTime) status = 'ongoing';

            events.push({
                id: cls.id,
                title: cls.subject || cls.title,
                type: 'class',
                category: cls.type && cls.type.toLowerCase() === 'elective' ? 'elective' : 'compulsory',
                startTime: localStartTime,
                endTime: localEndTime,
                duration: '', // Will be calculated globally post-sort
                teacherName: cls.teacher ? cls.teacher.fullName : 'Class Teacher',
                location: cls.location || 'Main Campus',
                description: cls.description || null,
                meetingUrl: null, // Classes are assumed physical without LS 
                status
            });
        });

        // Map exact LiveSessions
        liveSessions.forEach(ls => {
            let status: 'upcoming' | 'ongoing' | 'completed' = 'upcoming';
            if (now > ls.endTime) status = 'completed';
            else if (now >= ls.startTime && now <= ls.endTime) status = 'ongoing';

            events.push({
                id: ls.id,
                title: ls.title || (ls.class ? ls.class.subject : 'Virtual Session'),
                type: 'live-session',
                category: 'extra', // LiveSessions map strictly to the Extra UI tab
                startTime: ls.startTime,
                endTime: ls.endTime,
                duration: '', // Will be calculated globally post-sort
                teacherName: ls.class && ls.class.teacher ? ls.class.teacher.fullName : 'Host',
                location: ls.meetingUrl ? 'Virtual (Zoom)' : 'Online',
                description: ls.description || null,
                meetingUrl: ls.meetingUrl || null,
                status
            });
        });

        events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

        // Attach duration strings post-sort
        events.forEach(event => {
            const diffMs = event.endTime.getTime() - event.startTime.getTime();
            const diffMins = Math.round(diffMs / 60000);
            const hrs = Math.floor(diffMins / 60);
            const mins = diffMins % 60;

            if (hrs > 0 && mins > 0) event.duration = `${hrs} hr ${mins} mins`;
            else if (hrs > 0) event.duration = `${hrs} hr`;
            else event.duration = `${mins} mins`;
        });

        return {
            date: targetDate.toISOString().split('T')[0],
            events
        };
    }

    async getRangeSchedule(userId: string, startDateStr: string, endDateStr: string): Promise<DailyTimetableDto[]> {
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
            throw new Error('Invalid date range provided');
        }

        const payloads: DailyTimetableDto[] = [];
        const current = new Date(start);

        // Max out at 14 days to prevent malicious unbounded loops
        let iterations = 0;
        while (current <= end && iterations < 14) {
            const dailyStr = current.toISOString().split('T')[0];
            payloads.push(await this.getDailySchedule(userId, dailyStr));
            current.setDate(current.getDate() + 1);
            iterations++;
        }

        return payloads;
    }

    async joinEvent(userId: string, joinDto: any): Promise<{ message: string; success: boolean }> {
        // Technically, regular Classes don't have a "Join" button in a virtual sense,
        // but LiveSessions do. We will mark attendance or simply return a success log.
        if (joinDto.type === 'live-session') {
            const session = await this.liveSessionRepository.findOne({ where: { id: joinDto.eventId } });
            if (!session) throw new NotFoundException('Live session not found');
            // An advanced implementation might insert an attendance cross-record here.
            return { message: 'Successfully joined virtual live session', success: true };
        }

        return { message: 'Action recorded successfully', success: true };
    }

    async generateTimetablePdf(userId: string, startDateStr?: string): Promise<Buffer> {
        // Determine the Monday of the requested week
        const baseDate = startDateStr ? new Date(startDateStr) : new Date();
        const dayOfWeek = baseDate.getDay(); // 0=Sun, 1=Mon, ...
        const monday = new Date(baseDate);
        monday.setDate(baseDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

        const friday = new Date(monday);
        friday.setDate(monday.getDate() + 4);

        const mondayStr = monday.toISOString().split('T')[0];
        const fridayStr = friday.toISOString().split('T')[0];

        // Fetch the full week's data
        const weekSchedule = await this.getRangeSchedule(userId, mondayStr, fridayStr);

        // Fetch student name for the header
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['student'],
        });
        const studentName = user?.student?.fullName || 'Student';

        // Build PDF
        return new Promise<Buffer>((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 40 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk: Buffer) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const pageWidth = doc.page.width - 80; // margins
            const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

            // --- Title ---
            doc.fontSize(20).font('Helvetica-Bold').text('Weekly Timetable', { align: 'center' });
            doc.moveDown(0.3);
            doc.fontSize(11).font('Helvetica').text(`${studentName}  •  ${mondayStr} to ${fridayStr}`, { align: 'center' });
            doc.moveDown(1);

            // --- Table header ---
            const colWidths = [80, 55, 160, 120, 120, 80, 80]; // Day, Time, Subject, Teacher, Location, Duration, Type
            const headers = ['Day', 'Time', 'Subject', 'Teacher', 'Location', 'Duration', 'Type'];
            const headerY = doc.y;
            let xPos = 40;

            doc.fontSize(9).font('Helvetica-Bold');
            doc.rect(40, headerY - 4, pageWidth, 18).fill('#1a5276');
            doc.fill('#ffffff');
            headers.forEach((h, i) => {
                doc.text(h, xPos + 4, headerY, { width: colWidths[i] - 8, align: 'left' });
                xPos += colWidths[i];
            });
            doc.fill('#000000');
            doc.moveDown(0.6);

            // --- Rows ---
            doc.font('Helvetica').fontSize(8);
            let rowIndex = 0;

            weekSchedule.forEach((day, dayIdx) => {
                if (day.events.length === 0) {
                    // Empty row for the day
                    const y = doc.y;
                    const bgColor = rowIndex % 2 === 0 ? '#f2f3f4' : '#ffffff';
                    doc.rect(40, y - 2, pageWidth, 16).fill(bgColor);
                    doc.fill('#000000');
                    xPos = 40;
                    doc.text(dayNames[dayIdx] || day.date, xPos + 4, y, { width: colWidths[0] - 8 });
                    xPos += colWidths[0];
                    doc.text('No classes', xPos + 4, y, { width: 300 });
                    doc.moveDown(0.7);
                    rowIndex++;
                    return;
                }

                day.events.forEach((event, eventIdx) => {
                    // Check if we need a new page
                    if (doc.y > doc.page.height - 60) {
                        doc.addPage();
                    }

                    const y = doc.y;
                    const bgColor = rowIndex % 2 === 0 ? '#f2f3f4' : '#ffffff';
                    doc.rect(40, y - 2, pageWidth, 16).fill(bgColor);
                    doc.fill('#000000');

                    xPos = 40;
                    const timeStr = event.startTime
                        ? new Date(event.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                        : '-';

                    const rowData = [
                        eventIdx === 0 ? (dayNames[dayIdx] || day.date) : '',
                        timeStr,
                        event.title || '-',
                        event.teacherName || '-',
                        event.location || '-',
                        event.duration || '-',
                        event.category || '-',
                    ];

                    rowData.forEach((text, i) => {
                        doc.text(text, xPos + 4, y, { width: colWidths[i] - 8, align: 'left' });
                        xPos += colWidths[i];
                    });

                    doc.moveDown(0.7);
                    rowIndex++;
                });
            });

            // Footer
            doc.moveDown(1);
            doc.fontSize(7).fillColor('#888888').text(`Generated on ${new Date().toLocaleString()}`, { align: 'right' });

            doc.end();
        });
    }
}
