import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User, Student, Attendance, LeaveRequest, AttendanceStatus, Class } from '../entities';
import { AttendanceOverviewDto, CreateLeaveRequestDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Attendance) private attendanceRepository: Repository<Attendance>,
        @InjectRepository(LeaveRequest) private leaveRequestRepository: Repository<LeaveRequest>,
        @InjectRepository(Class) private classRepository: Repository<Class>,
    ) { }

    private async getStudent(userId: string): Promise<Student> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['student'],
        });
        if (!user || !user.student) {
            throw new NotFoundException('Student profile not found');
        }
        return user.student;
    }

    async getOverview(userId: string, startDate?: string, endDate?: string): Promise<AttendanceOverviewDto> {
        const student = await this.getStudent(userId);

        const whereClause: any = { student: { id: student.id } };

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            // Ensure end date covers the whole day
            end.setHours(23, 59, 59, 999);
            whereClause.date = Between(start, end);
        }

        const allRecords = await this.attendanceRepository.find({
            where: whereClause,
            relations: ['class'],
            order: { date: 'DESC' }
        });

        const overview = {
            totalClasses: allRecords.length,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            attendancePercentage: 0,
            recentAttendance: [] as any[]
        };

        allRecords.forEach(record => {
            if (record.status === AttendanceStatus.PRESENT) overview.present++;
            else if (record.status === AttendanceStatus.ABSENT) overview.absent++;
            else if (record.status === AttendanceStatus.LATE) overview.late++;
            else if (record.status === AttendanceStatus.EXCUSED) overview.excused++;
        });

        if (overview.totalClasses > 0) {
            // Typically present and late count positively towards basic attendance.
            overview.attendancePercentage = Math.round(((overview.present + overview.late) / overview.totalClasses) * 100);
        }

        // Format top 5 for the UI preview table
        overview.recentAttendance = allRecords.slice(0, 5).map(r => ({
            id: r.id,
            date: r.date.toISOString().split('T')[0],
            subject: r.class ? (r.class.subject || r.class.title) : 'General',
            timeIn: r.timeIn || '08:00 AM', // Fallback to 8AM for un-seeded old physical DB rows
            status: r.status
        }));

        return overview;
    }

    async getCalendar(userId: string, month: number, year: number) {
        const student = await this.getStudent(userId);

        // Create UTC date bounds for the full month
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

        const records = await this.attendanceRepository.find({
            where: {
                student: { id: student.id },
                date: Between(startDate, endDate)
            }
        });

        // Compress multiple classes in a day into an 'overallStatus'
        const dailyMap: Record<string, string> = {};

        records.forEach(r => {
            const dayStr = r.date.toISOString().split('T')[0];
            // If any class was absent heavily, mark UI dot absent. Otherwise present.
            if (!dailyMap[dayStr]) {
                dailyMap[dayStr] = r.status;
            } else if (r.status === AttendanceStatus.ABSENT) {
                dailyMap[dayStr] = AttendanceStatus.ABSENT; // Absent supersedes for calendar dot coloring
            }
        });

        return Object.keys(dailyMap).map(date => ({
            date,
            overallStatus: dailyMap[date]
        }));
    }

    async getSubjectProgress(userId: string) {
        const student = await this.getStudent(userId);

        const records = await this.attendanceRepository.find({
            where: { student: { id: student.id } },
            relations: ['class']
        });

        const subjectMap: Record<string, { total: number, attended: number }> = {};

        records.forEach(r => {
            const subjectName = r.class ? (r.class.subject || r.class.title) : 'General';
            if (!subjectMap[subjectName]) subjectMap[subjectName] = { total: 0, attended: 0 };

            subjectMap[subjectName].total++;
            if (r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE) {
                subjectMap[subjectName].attended++;
            }
        });

        return Object.keys(subjectMap).map(subjectName => {
            const metric = subjectMap[subjectName];
            return {
                subjectName,
                totalClassesHeld: metric.total,
                classesAttended: metric.attended,
                attendancePercentage: Math.round((metric.attended / metric.total) * 100)
            };
        });
    }

    async getHistory(userId: string, query: { page: number, limit: number, status?: string, subject?: string, startDate?: string, endDate?: string }) {
        const student = await this.getStudent(userId);
        const queryBuilder = this.attendanceRepository.createQueryBuilder('attendance')
            .leftJoinAndSelect('attendance.class', 'class')
            .leftJoinAndSelect('class.teacher', 'teacher')
            .where('attendance.student_id = :studentId', { studentId: student.id });

        if (query.status) {
            queryBuilder.andWhere('attendance.status = :status', { status: query.status });
        }

        if (query.subject) {
            // Allow searching by exact subject string or title
            queryBuilder.andWhere('(class.subject ILIKE :subject OR class.title ILIKE :subject)', { subject: `%${query.subject}%` });
        }

        if (query.startDate && query.endDate) {
            queryBuilder.andWhere('attendance.date BETWEEN :start AND :end', { start: query.startDate, end: query.endDate });
        }

        queryBuilder.orderBy('attendance.date', 'DESC');

        const totalRecords = await queryBuilder.getCount();

        queryBuilder.skip((query.page - 1) * query.limit).take(query.limit);
        const records = await queryBuilder.getMany();

        return {
            meta: {
                totalRecords,
                totalPages: Math.ceil(totalRecords / query.limit),
                currentPage: Number(query.page),
            },
            records: records.map(r => ({
                id: r.id,
                date: r.date.toISOString().split('T')[0],
                subject: r.class ? (r.class.subject || r.class.title) : 'General',
                timeIn: r.timeIn || '08:00 AM',
                timeOut: r.timeOut || '02:30 PM',
                status: r.status,
                teacherName: r.class && r.class.teacher ? r.class.teacher.fullName : 'Class Teacher',
                remarks: r.notes || ''
            }))
        };
    }

    async getLeaveRequests(userId: string) {
        const student = await this.getStudent(userId);
        return this.leaveRequestRepository.find({
            where: { student: { id: student.id } },
            order: { createdAt: 'DESC' }
        });
    }

    async createLeaveRequest(userId: string, dto: CreateLeaveRequestDto) {
        const student = await this.getStudent(userId);
        const request = this.leaveRequestRepository.create({
            ...dto,
            student,
        });
        const saved = await this.leaveRequestRepository.save(request);
        return {
            message: 'Leave request submitted successfully',
            leaveRequest: saved
        };
    }
}
