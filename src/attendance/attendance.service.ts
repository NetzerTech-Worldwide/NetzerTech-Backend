import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User, Student, Attendance, LeaveRequest, AttendanceStatus, Class } from '../entities';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AttendanceOverviewDto, CreateLeaveRequestDto, UpdateLeaveRequestDto, AdminClassAttendanceDto, AdminStudentAttendanceDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Attendance) private attendanceRepository: Repository<Attendance>,
        @InjectRepository(LeaveRequest) private leaveRequestRepository: Repository<LeaveRequest>,
        @InjectRepository(Class) private classRepository: Repository<Class>,
        @InjectDataSource() private dataSource: DataSource,
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

    async getLeaveRequestStats(userId: string) {
        const student = await this.getStudent(userId);
        const stats = await this.leaveRequestRepository
            .createQueryBuilder('lr')
            .select('lr.status', 'status')
            .addSelect('COUNT(lr.id)', 'count')
            .where('lr.student_id = :studentId', { studentId: student.id })
            .groupBy('lr.status')
            .getRawMany();

        const result = { total: 0, pending: 0, approved: 0, rejected: 0 };
        stats.forEach(s => {
            const count = parseInt(s.count, 10);
            result.total += count;
            if (s.status === 'pending') result.pending += count;
            else if (s.status === 'approved') result.approved += count;
            else if (s.status === 'rejected') result.rejected += count;
        });

        return result;
    }

    async getLeaveRequests(userId: string, status?: string) {
        const student = await this.getStudent(userId);
        
        const query = this.leaveRequestRepository.createQueryBuilder('lr')
            .leftJoinAndSelect('lr.reviewedBy', 'admin')
            .where('lr.student_id = :studentId', { studentId: student.id });

        if (status && status !== 'All') {
            query.andWhere('lr.status = :status', { status: status.toLowerCase() });
        }

        query.orderBy('lr.createdAt', 'DESC');

        const requests = await query.getMany();

        return requests.map(r => ({
            id: r.id,
            requestType: r.leaveType,
            dateSubmitted: r.createdAt.toISOString().split('T')[0],
            leaveDate: r.fromDate instanceof Date ? r.fromDate.toISOString().split('T')[0] : r.fromDate,
            returnDate: r.toDate instanceof Date ? r.toDate.toISOString().split('T')[0] : r.toDate,
            status: r.status,
            approvedBy: r.reviewedBy ? r.reviewedBy.fullName : (r.status === 'pending' ? 'In Progress' : 'Admin'),
        }));
    }

    async getLeaveRequestById(userId: string, id: string) {
        const student = await this.getStudent(userId);
        const r = await this.leaveRequestRepository.findOne({
            where: { id, student: { id: student.id } },
            relations: ['reviewedBy']
        });

        if (!r) throw new NotFoundException('Leave request not found');

        return {
            id: r.id,
            requestType: r.leaveType,
            dateSubmitted: r.createdAt.toISOString().split('T')[0],
            leaveDate: r.fromDate instanceof Date ? r.fromDate.toISOString().split('T')[0] : r.fromDate,
            returnDate: r.toDate instanceof Date ? r.toDate.toISOString().split('T')[0] : r.toDate,
            status: r.status,
            approvedBy: r.reviewedBy ? r.reviewedBy.fullName : (r.status === 'pending' ? 'In Progress' : 'Admin'),
            reason: r.reason,
            adminComments: r.reviewerComments,
            supportingDocumentUrl: r.supportingDocumentUrl
        };
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

    async getAdminClasses(): Promise<AdminClassAttendanceDto[]> {
        const classes = await this.classRepository.find({ relations: ['teacher'] });
        const results: AdminClassAttendanceDto[] = [];

        for (const cls of classes) {
            const studentsCount = await this.dataSource.getRepository(Student).count({
                where: { classes: { id: cls.id } }
            });

            const attendanceRecords = await this.attendanceRepository.find({
                where: { class: { id: cls.id } }
            });

            const total = attendanceRecords.length;
            const present = attendanceRecords.filter(a => a.status === AttendanceStatus.PRESENT).length;
            const absent = attendanceRecords.filter(a => a.status === AttendanceStatus.ABSENT).length;
            const late = attendanceRecords.filter(a => a.status === AttendanceStatus.LATE).length;
            const excused = attendanceRecords.filter(a => a.status === AttendanceStatus.EXCUSED).length;

            results.push({
                class: cls.title,
                students: studentsCount,
                avgAttendance: total > 0 ? Math.round((present / total) * 100) : 100,
                totalPresent: present,
                totalAbsent: absent,
                totalLate: late,
                totalExcused: excused,
                classTeacher: cls.teacher?.fullName || 'Unassigned'
            });
        }

        return results;
    }

    async getAdminStudents(className?: string): Promise<AdminStudentAttendanceDto[]> {
        const studentsQuery = this.dataSource.getRepository(Student).createQueryBuilder('student')
            .leftJoinAndSelect('student.user', 'user')
            .leftJoinAndSelect('student.classes', 'class');

        if (className) {
            studentsQuery.andWhere('class.title = :className', { className });
        }

        const students = await studentsQuery.getMany();
        const results: AdminStudentAttendanceDto[] = [];

        for (const student of students) {
            const attendanceRecords = await this.attendanceRepository.find({
                where: { student: { id: student.id } }
            });

            const total = attendanceRecords.length;
            const present = attendanceRecords.filter(a => a.status === AttendanceStatus.PRESENT).length;
            const absent = attendanceRecords.filter(a => a.status === AttendanceStatus.ABSENT).length;
            const late = attendanceRecords.filter(a => a.status === AttendanceStatus.LATE).length;
            const excused = attendanceRecords.filter(a => a.status === AttendanceStatus.EXCUSED).length;

            results.push({
                id: student.studentId || student.id,
                name: student.fullName,
                class: student.classes.length > 0 ? student.classes[0].title : 'N/A',
                totalDays: total,
                present,
                absent,
                late,
                excused,
                attendanceRate: total > 0 ? Math.round((present / total) * 100) : 100
            });
        }

        return results;
    }

    async getAdminAllLeaveRequests(status?: string) {
        const query = this.leaveRequestRepository.createQueryBuilder('lr')
            .leftJoinAndSelect('lr.student', 'student')
            .leftJoinAndSelect('student.user', 'studentUser')
            .leftJoinAndSelect('lr.reviewedBy', 'admin');

        if (status && status !== 'All') {
            query.andWhere('lr.status = :status', { status: status.toLowerCase() });
        }

        query.orderBy('lr.createdAt', 'DESC');

        const requests = await query.getMany();

        return requests.map(r => ({
            id: r.id,
            type: 'leave_request',
            category: 'Leave Requests',
            title: `Leave Request: ${r.student.fullName}`,
            description: r.reason,
            submittedBy: r.student.fullName,
            submittedDate: r.createdAt.toISOString().split('T')[0],
            session: '2025/2026', // Placeholder
            term: 'Second Term', // Placeholder
            priority: 'Medium', // Placeholder
            status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
            details: {
                'Leave Type': r.leaveType,
                'Start Date': r.fromDate instanceof Date ? r.fromDate.toISOString().split('T')[0] : r.fromDate,
                'End Date': r.toDate instanceof Date ? r.toDate.toISOString().split('T')[0] : r.toDate,
                'Reason': r.reason
            },
            attachments: r.supportingDocumentUrl ? [r.supportingDocumentUrl] : []
        }));
    }

    async updateLeaveRequestStatus(id: string, dto: UpdateLeaveRequestDto, adminUserId: string) {
        const request = await this.leaveRequestRepository.findOne({
            where: { id },
            relations: ['student', 'student.user']
        });

        if (!request) throw new NotFoundException('Leave request not found');

        const admin = await this.dataSource.getRepository(Admin).findOne({ where: { user: { id: adminUserId } } });
        if (!admin) throw new NotFoundException('Admin profile not found');

        request.status = dto.status.toLowerCase() as any;
        request.reviewerComments = dto.adminComments;
        request.reviewedBy = admin;

        return this.leaveRequestRepository.save(request);
    }
}
