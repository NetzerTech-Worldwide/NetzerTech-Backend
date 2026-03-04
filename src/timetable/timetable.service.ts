import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User, Student, Class, LiveSession } from '../entities';
import { DailyTimetableDto, TimetableEventDto } from './dto/timetable.dto';

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
                startTime: localStartTime,
                endTime: localEndTime,
                teacherName: cls.teacher ? cls.teacher.fullName : 'Class Teacher',
                location: cls.location || 'Main Campus',
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
                startTime: ls.startTime,
                endTime: ls.endTime,
                teacherName: ls.class && ls.class.teacher ? ls.class.teacher.fullName : 'Host',
                location: ls.meetingUrl ? 'Virtual (Zoom)' : 'Online',
                status
            });
        });

        // Sort chronologically ascending
        events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

        return {
            date: targetDate.toISOString().split('T')[0],
            events
        };
    }
}
