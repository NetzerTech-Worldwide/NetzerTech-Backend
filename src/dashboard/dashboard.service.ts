import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThanOrEqual, Between, In } from 'typeorm';
import { CacheService } from '../common/services/cache.service';
import {
  User,
  Student,
  Teacher,
  Parent,
  Class,
  ClassActivity,
  Test,
  ForumTopic,
  Event,
  Attendance,
  Fee,
  Message,
  AcademicProgress,
  Reminder,
  AttendanceStatus,
  ActivityLog,
  ActivityType,
} from '../entities';
import { UserRole } from '../common/enums/user-role.enum';
import {
  SecondaryStudentDashboardDto,
  UniversityStudentDashboardDto,
  TeacherDashboardDto,
  ParentDashboardDto,
} from './dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(ClassActivity)
    private classActivityRepository: Repository<ClassActivity>,
    @InjectRepository(Test)
    private testRepository: Repository<Test>,
    @InjectRepository(ForumTopic)
    private forumTopicRepository: Repository<ForumTopic>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Fee)
    private feeRepository: Repository<Fee>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(AcademicProgress)
    private academicProgressRepository: Repository<AcademicProgress>,
    @InjectRepository(Reminder)
    private reminderRepository: Repository<Reminder>,
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
    private cacheService: CacheService,
  ) { }

  async getSecondaryStudentDashboard(userId: string): Promise<SecondaryStudentDashboardDto> {
    // Check cache first
    const cacheKey = this.cacheService.generateKey('dashboard', 'secondary-student', userId);
    const cached = await this.cacheService.get<SecondaryStudentDashboardDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student', 'student.academicProgress'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const student = user.student;
    const now = new Date();

    // Get next class
    const nextClass = await this.classRepository
      .createQueryBuilder('class')
      .leftJoinAndSelect('class.teacher', 'teacher')
      .leftJoin('class.students', 'student')
      .where('student.id = :studentId', { studentId: student.id })
      .andWhere('class.startTime > :now', { now })
      .andWhere('class.isActive = :isActive', { isActive: true })
      .orderBy('class.startTime', 'ASC')
      .getOne();

    // Get upcoming class activities and assignments
    const classActivities = await this.classActivityRepository
      .createQueryBuilder('classActivity')
      .leftJoin('classActivity.students', 'student')
      .where('student.id = :studentId', { studentId: student.id })
      .andWhere('classActivity.dueDate > :now', { now })
      .andWhere('classActivity.isCompleted = :isCompleted', { isCompleted: false })
      .orderBy('classActivity.dueDate', 'ASC')
      .limit(10)
      .getMany();

    // Get upcoming tests
    const upcomingTests = await this.testRepository
      .createQueryBuilder('test')
      .leftJoin('test.students', 'student')
      .where('student.id = :studentId', { studentId: student.id })
      .andWhere('test.testDate > :now', { now })
      .orderBy('test.testDate', 'ASC')
      .limit(10)
      .getMany();

    // Get academic progress
    const academicProgress = await this.academicProgressRepository.findOne({
      where: { student: { id: student.id } },
    });

    // Get reminders
    const reminders = await this.reminderRepository.find({
      where: {
        user: { id: userId },
        isCompleted: false,
        dueDate: MoreThan(now),
      },
      order: { dueDate: 'ASC' },
      take: 10,
    });

    // Get latest forum topics
    const latestForumTopics = await this.forumTopicRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // Get upcoming events
    const upcomingEvents = await this.eventRepository.find({
      where: {
        students: { id: student.id },
        eventDate: MoreThan(now),
        isActive: true,
      },
      order: { eventDate: 'ASC' },
      take: 10,
    });

    const result = {
      profile: {
        fullName: student.fullName,
        studentId: student.studentId,
        grade: student.grade,
        school: student.school,
        email: user.email,
        profilePicture: user.profilePicture,
      },
      nextClass: nextClass
        ? {
          id: nextClass.id,
          title: nextClass.title,
          subject: nextClass.subject,
          startTime: nextClass.startTime,
          endTime: nextClass.endTime,
          location: nextClass.location,
        }
        : null,
      classActivities: classActivities.map((a) => ({
        id: a.id,
        title: a.title,
        subject: a.subject,
        dueDate: a.dueDate,
        totalPoints: a.totalPoints,
      })),
      upcomingTests: upcomingTests.map((t) => ({
        id: t.id,
        title: t.title,
        subject: t.subject,
        testDate: t.testDate,
        totalPoints: t.totalPoints,
      })),
      academicProgress: academicProgress
        ? {
          gpa: academicProgress.gpa,
          grades: academicProgress.grades,
          totalCredits: academicProgress.totalCredits,
          completedCredits: academicProgress.completedCredits,
          progressPercentage: academicProgress.totalCredits > 0
            ? Math.round((academicProgress.completedCredits / academicProgress.totalCredits) * 100 * 100) / 100
            : 0,
        }
        : null,
      reminders: reminders.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        dueDate: r.dueDate,
        isImportant: r.isImportant,
        type: r.type,
        status: r.status,
      })),
      latestForumTopics: latestForumTopics.map((t) => ({
        id: t.id,
        title: t.title,
        content: t.content,
        views: t.views,
        replies: t.replies,
        createdAt: t.createdAt,
      })),
      upcomingEvents: upcomingEvents.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        eventDate: e.eventDate,
        location: e.location,
        image: e.image,
      })),
    };

    // Cache the result for 5 minutes
    await this.cacheService.set(cacheKey, result, 300000);
    return result;
  }

  async getUniversityStudentDashboard(userId: string): Promise<UniversityStudentDashboardDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student', 'student.academicProgress'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const student = user.student;
    const now = new Date();

    // Get next class
    const nextClass = await this.classRepository
      .createQueryBuilder('class')
      .leftJoinAndSelect('class.teacher', 'teacher')
      .leftJoin('class.students', 'student')
      .where('student.id = :studentId', { studentId: student.id })
      .andWhere('class.startTime > :now', { now })
      .andWhere('class.isActive = :isActive', { isActive: true })
      .orderBy('class.startTime', 'ASC')
      .getOne();

    // Get upcoming class activities and assignments
    const classActivities = await this.classActivityRepository
      .createQueryBuilder('classActivity')
      .leftJoin('classActivity.students', 'student')
      .where('student.id = :studentId', { studentId: student.id })
      .andWhere('classActivity.dueDate > :now', { now })
      .andWhere('classActivity.isCompleted = :isCompleted', { isCompleted: false })
      .orderBy('classActivity.dueDate', 'ASC')
      .limit(10)
      .getMany();

    // Get academic progress with CGPA
    const academicProgress = await this.academicProgressRepository.findOne({
      where: { student: { id: student.id } },
    });

    // Get reminders
    const reminders = await this.reminderRepository.find({
      where: {
        user: { id: userId },
        isCompleted: false,
        dueDate: MoreThan(now),
      },
      order: { dueDate: 'ASC' },
      take: 10,
    });

    // Get latest forum topics
    const latestForumTopics = await this.forumTopicRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // Get upcoming events
    const upcomingEvents = await this.eventRepository.find({
      where: {
        students: { id: student.id },
        eventDate: MoreThan(now),
        isActive: true,
      },
      order: { eventDate: 'ASC' },
      take: 10,
    });

    return {
      nextClass: nextClass
        ? {
          id: nextClass.id,
          title: nextClass.title,
          subject: nextClass.subject,
          startTime: nextClass.startTime,
          endTime: nextClass.endTime,
          location: nextClass.location,
        }
        : null,
      classActivities: classActivities.map((a) => ({
        id: a.id,
        title: a.title,
        subject: a.subject,
        dueDate: a.dueDate,
        totalPoints: a.totalPoints,
      })),
      cgpa: academicProgress?.cgpa || null,
      academicProgress: academicProgress
        ? {
          cgpa: academicProgress.cgpa,
          gpa: academicProgress.gpa,
          grades: academicProgress.grades,
          semesterResults: academicProgress.semesterResults,
          totalCredits: academicProgress.totalCredits,
          completedCredits: academicProgress.completedCredits,
          progressPercentage: academicProgress.totalCredits > 0
            ? Math.round((academicProgress.completedCredits / academicProgress.totalCredits) * 100 * 100) / 100
            : 0,
        }
        : null,
      reminders: reminders.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        dueDate: r.dueDate,
        isImportant: r.isImportant,
        type: r.type,
        status: r.status,
      })),
      latestForumTopics: latestForumTopics.map((t) => ({
        id: t.id,
        title: t.title,
        content: t.content,
        views: t.views,
        replies: t.replies,
        createdAt: t.createdAt,
      })),
      upcomingEvents: upcomingEvents.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        eventDate: e.eventDate,
        location: e.location,
        image: e.image,
      })),
    };
  }

  async getTeacherDashboard(userId: string): Promise<TeacherDashboardDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['teacher'],
    });

    if (!user || !user.teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    const teacher = user.teacher;
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // Get today's classes
    const todayClasses = await this.classRepository.find({
      where: {
        teacher: { id: teacher.id },
        startTime: Between(todayStart, todayEnd),
        isActive: true,
      },
      relations: ['students'],
      order: { startTime: 'ASC' },
    });

    const activeStudentIds = await this.classRepository
      .createQueryBuilder('class')
      .leftJoin('class.students', 'student')
      .select('DISTINCT student.id', 'studentId')
      .where('class.teacher = :teacherId', { teacherId: teacher.id })
      .andWhere('class.isActive = :isActive', { isActive: true })
      .getRawMany()
      .then((results) => results.map((r) => r.studentId).filter((id) => id));

    const activeStudents = activeStudentIds.length > 0
      ? await this.studentRepository.find({
        where: { id: In(activeStudentIds) },
        relations: ['user'],
        take: 20,
      })
      : [];

    // Get pending grades (class activities with ungraded submissions)
    const classActivities = await this.classActivityRepository.find({
      where: {
        teacher: { id: teacher.id },
        dueDate: LessThanOrEqual(now),
      },
      relations: ['students'],
    });

    const pendingGrades = classActivities.map((activity) => ({
      id: activity.id,
      title: activity.title,
      subject: activity.subject,
      dueDate: activity.dueDate,
      pendingCount: activity.students?.length || 0,
    }));

    const recentActivities = await this.activityLogRepository.find({
      where: { teacher: { id: teacher.id } },
      order: { createdAt: 'DESC' },
      take: 10,
      relations: ['user'],
    });

    const formattedActivities = recentActivities.map((activity) => ({
      id: activity.id,
      type: activity.activityType,
      description: activity.description,
      createdAt: activity.createdAt,
    }));

    // Get students by gender - Optimized with database aggregation
    const studentsByGender = activeStudentIds.length > 0
      ? await this.studentRepository
        .createQueryBuilder('student')
        .select('student.gender', 'gender')
        .addSelect('COUNT(*)', 'count')
        .where('student.id IN (:...ids)', { ids: activeStudentIds })
        .groupBy('student.gender')
        .getRawMany()
        .then((results) => {
          const genderCounts = { boys: 0, girls: 0 };
          results.forEach((row) => {
            const gender = row.gender?.toLowerCase();
            if (gender === 'male' || gender === 'boy') {
              genderCounts.boys = parseInt(row.count, 10);
            } else if (gender === 'female' || gender === 'girl') {
              genderCounts.girls = parseInt(row.count, 10);
            }
          });
          return genderCounts;
        })
      : { boys: 0, girls: 0 };

    return {
      todayClasses: todayClasses.map((c) => ({
        id: c.id,
        title: c.title,
        subject: c.subject,
        startTime: c.startTime,
        endTime: c.endTime,
        location: c.location,
        studentCount: c.students?.length || 0,
      })),
      activeStudents: activeStudents.map((s) => ({
        id: s.id,
        studentId: s.studentId,
        fullName: s.fullName,
        grade: s.grade,
        profilePicture: s.user?.profilePicture,
      })),
      pendingGrades: pendingGrades.slice(0, 10),
      recentActivities: formattedActivities,
      studentsByGender,
    };
  }

  async getParentDashboard(userId: string): Promise<ParentDashboardDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['parent', 'parent.children'],
    });

    if (!user || !user.parent) {
      throw new NotFoundException('Parent profile not found');
    }

    const parent = user.parent;
    const children = parent.children;

    if (!children || children.length === 0) {
      throw new NotFoundException('No children found for this parent');
    }

    // For now, get the first child (can be extended to support multiple children)
    const student = children[0];

    // Get full student profile
    const studentProfile = await this.studentRepository.findOne({
      where: { id: student.id },
      relations: ['user'],
    });

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found');
    }

    // Get attendance
    const attendances = await this.attendanceRepository.find({
      where: { student: { id: student.id } },
    });

    const totalDays = attendances.length;
    const presentDays = attendances.filter((a) => a.status === AttendanceStatus.PRESENT).length;
    const absentDays = attendances.filter((a) => a.status === AttendanceStatus.ABSENT).length;
    const lateDays = attendances.filter((a) => a.status === AttendanceStatus.LATE).length;
    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // Get fees
    const fees = await this.feeRepository.find({
      where: { student: { id: student.id } },
    });

    const totalFee = fees.reduce((sum, fee) => sum + Number(fee.amount), 0);
    const paidFee = fees.filter((f) => f.status === 'paid').reduce((sum, fee) => sum + Number(fee.amount), 0);
    const pendingFee = fees.filter((f) => f.status === 'pending').reduce((sum, fee) => sum + Number(fee.amount), 0);
    const overdueFee = fees.filter((f) => f.status === 'overdue').reduce((sum, fee) => sum + Number(fee.amount), 0);

    // Get unread messages
    const unreadMessages = await this.messageRepository.count({
      where: {
        recipient: { id: userId },
        isRead: false,
      },
    });

    // Get payment summary
    const recentPayments = fees
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, 10)
      .map((fee) => ({
        id: fee.id,
        title: fee.title,
        amount: Number(fee.amount),
        status: fee.status,
        paidDate: fee.paidDate,
        dueDate: fee.dueDate,
      }));

    return {
      studentProfile: {
        id: studentProfile.id,
        studentId: studentProfile.studentId,
        fullName: studentProfile.fullName,
        dateOfBirth: studentProfile.dateOfBirth,
        grade: studentProfile.grade,
        school: studentProfile.school,
        gender: studentProfile.gender,
        profilePicture: studentProfile.user?.profilePicture,
      },
      attendance: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100,
      },
      totalFee,
      unreadMessages,
      paymentSummary: {
        recentPayments,
        summary: {
          totalFee,
          paidFee,
          pendingFee,
          overdueFee,
        },
      },
    };
  }
}

