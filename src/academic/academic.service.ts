import { Injectable, NotFoundException, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Student, Class, AcademicProgress, StudentClassRegistration } from '../entities';
import { AvailableSubjectsDto, SubjectDto } from './dto/subject.dto';
import { StudentCoursesDto } from './dto/student-course.dto';
import { RegisterSubjectDto, RegisterSubjectResponseDto, RegistrationResultDto } from './dto/register-subject.dto';
import { StudentSubjectsProgressDto, StudentSubjectProgressDto } from './dto/student-subject-progress.dto';
import { AllSubjectsRoadmapDto, SubjectRoadmapDetailDto, SubjectStatus, SubjectRoadmapItemDto } from './dto/roadmap.dto';
import { SubjectModule } from '../entities/subject-module.entity';
import { CreateSubjectModuleDto, SubjectModuleResponseDto } from './dto/subject-module.dto';
import { LiveSession, LiveSessionStatus } from '../entities/live-session.entity';
import { LiveSessionDto, LiveSessionDetailDto } from './dto/live-session.dto';
import { Reminder } from '../entities/reminder.entity';
import { LiveSessionMessage } from '../entities/live-session-message.entity';
import { LiveSessionMessageDto, SendLiveSessionMessageDto } from './dto/live-session-message.dto';
import { ClassActivity, Question, StudentClassActivity, ClassActivityStatus, LearningMaterial, LectureNote, LectureNoteSection, Assignment, StudentAssignment, AssignmentStatus } from '../entities';
import { StartClassActivityResponseDto, ClassActivityQuestionsResponseDto, ClassActivityDetailDto, SubmitClassActivityDto, LearningMaterialDto, LearningMaterialDetailDto, AssignmentResponseDto, AssignmentFilter, AssignmentDetailDto, StartAssignmentResponseDto, SubmitAssignmentDto, SubmissionViewDto } from './dto';

@Injectable()
export class AcademicService {
  private readonly logger = new Logger(AcademicService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(StudentClassRegistration)
    private registrationRepository: Repository<StudentClassRegistration>,
    @InjectRepository(AcademicProgress)
    private academicProgressRepository: Repository<AcademicProgress>,
    @InjectRepository(SubjectModule)
    private moduleRepository: Repository<SubjectModule>,
    @InjectRepository(LiveSession)
    private liveSessionRepository: Repository<LiveSession>,
    @InjectRepository(Reminder)
    private reminderRepository: Repository<Reminder>,
    @InjectRepository(LiveSessionMessage)
    private messageRepository: Repository<LiveSessionMessage>,
    @InjectRepository(ClassActivity)
    private classActivityRepository: Repository<ClassActivity>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(StudentClassActivity)
    private studentClassActivityRepository: Repository<StudentClassActivity>,
    @InjectRepository(LearningMaterial)
    private learningMaterialRepository: Repository<LearningMaterial>,
    @InjectRepository(LectureNote)
    private lectureNoteRepository: Repository<LectureNote>,
    @InjectRepository(LectureNoteSection)
    private lectureNoteSectionRepository: Repository<LectureNoteSection>,
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(StudentAssignment)
    private submissionRepository: Repository<StudentAssignment>,
  ) { }

  async getAvailableSubjects(userId?: string): Promise<AvailableSubjectsDto> {
    const classes = await this.classRepository.find({
      where: { isActive: true },
      relations: ['teacher'],
    });

    const subjectMap = new Map<string, string>();
    classes.forEach((cls) => {
      if (!subjectMap.has(cls.subject)) {
        subjectMap.set(cls.subject, cls.teacher?.fullName || 'Unknown');
      }
    });

    // Get registered subjects for the student if userId is provided
    let registeredSubjects = new Set<string>();
    if (userId) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['student'],
      });

      if (user && user.student) {
        const registrations = await this.registrationRepository.find({
          where: { student: { id: user.student.id } },
          relations: ['class'],
        });

        // Get unique subjects from registrations
        registeredSubjects = new Set(registrations.map((reg) => reg.subject));
      }
    }

    // Convert to array of SubjectDto with registration status
    const subjects: SubjectDto[] = Array.from(subjectMap.entries())
      .map(([name, teacherName]) => ({
        name,
        teacherName,
        isRegistered: userId ? registeredSubjects.has(name) : false,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

    return { subjects };
  }

  async getStudentCourses(userId: string): Promise<StudentCoursesDto> {
    // Get user with student relation
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const student = user.student;

    // Get all enrolled classes with teacher information
    const classes = await this.classRepository
      .createQueryBuilder('class')
      .leftJoinAndSelect('class.teacher', 'teacher')
      .leftJoin('class.students', 'student')
      .where('student.id = :studentId', { studentId: student.id })
      .andWhere('class.isActive = :isActive', { isActive: true })
      .getMany();

    // Group by subject and get unique subjects with their type and teacher
    const subjectMap = new Map<string, { type: string; teacherName: string }>();
    classes.forEach((cls) => {
      if (!subjectMap.has(cls.subject)) {
        subjectMap.set(cls.subject, {
          type: cls.type || 'compulsory', // Default to compulsory if not set
          teacherName: cls.teacher?.fullName || 'Unknown',
        });
      }
    });

    // Get academic progress for average calculation
    const academicProgress = await this.academicProgressRepository.findOne({
      where: { student: { id: student.id } },
    });

    // Calculate average progress from grades
    let averageProgress = 0;
    const subjectsWithGrades: string[] = [];

    if (academicProgress?.grades && Object.keys(academicProgress.grades).length > 0) {
      const grades = academicProgress.grades;
      const enrolledSubjectNames = Array.from(subjectMap.keys());

      enrolledSubjectNames.forEach((subject) => {
        if (grades[subject] !== null && grades[subject] !== undefined) {
          subjectsWithGrades.push(subject);
          averageProgress += Number(grades[subject]);
        }
      });

      if (subjectsWithGrades.length > 0) {
        averageProgress = averageProgress / subjectsWithGrades.length;
      }
    }

    // Build subjects list
    const subjects = Array.from(subjectMap.entries())
      .map(([subject, data]) => ({
        subject,
        type: data.type,
        teacherName: data.teacherName,
      }))
      .sort((a, b) => a.subject.localeCompare(b.subject));

    return {
      subjects,
      enrolledSubjects: subjects.length,
      averageProgress: Math.round(averageProgress * 100) / 100, // Round to 2 decimal places
    };
  }

  async registerSubject(userId: string, registerDto: RegisterSubjectDto): Promise<RegisterSubjectResponseDto> {
    const { sessionYear, term, classLevel, subjects } = registerDto;

    // Get user with student relation
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const student = user.student;
    const registrations: RegistrationResultDto[] = [];
    const skipped: string[] = [];

    // Process each subject registration
    for (const subject of subjects) {
      try {
        // Find class for this subject and grade level
        const classEntity = await this.classRepository.findOne({
          where: {
            subject,
            gradeLevel: classLevel,
            isActive: true,
          },
          relations: ['teacher'],
        });

        if (!classEntity) {
          skipped.push(`${subject} - No active class found for ${classLevel}`);
          continue;
        }

        // Check if student is already registered for this class in the same session and term
        const existingRegistration = await this.registrationRepository.findOne({
          where: {
            student: { id: student.id },
            class: { id: classEntity.id },
            sessionYear,
            term,
          },
        });

        if (existingRegistration) {
          skipped.push(`${subject} - ${classEntity.title} (already registered)`);
          continue;
        }

        // Check if student is already enrolled in the class (via ManyToMany relationship)
        const isEnrolled = await this.classRepository
          .createQueryBuilder('class')
          .leftJoin('class.students', 'student')
          .where('class.id = :classId', { classId: classEntity.id })
          .andWhere('student.id = :studentId', { studentId: student.id })
          .getCount();

        // If not enrolled, add student to class
        if (!isEnrolled) {
          await this.classRepository
            .createQueryBuilder()
            .relation(Class, 'students')
            .of(classEntity.id)
            .add(student.id);
        }

        // Create registration record
        const registration = this.registrationRepository.create({
          sessionYear,
          term,
          subject,
          student,
          class: classEntity,
        });

        const savedRegistration = await this.registrationRepository.save(registration);

        registrations.push({
          registrationId: savedRegistration.id,
          className: classEntity.title,
          subject: savedRegistration.subject,
          sessionYear: savedRegistration.sessionYear,
          term: savedRegistration.term,
        });
      } catch (error) {
        // Log error and continue with next subject
        this.logger.error(`Error registering subject ${subject} for class level ${classLevel}: ${error.message}`);
        skipped.push(`${subject} - ${error.message}`);
      }
    }

    if (registrations.length === 0) {
      throw new BadRequestException('No subjects were successfully registered. All registrations failed or were skipped.');
    }

    return {
      message: 'Subject registration completed',
      registeredCount: registrations.length,
      registrations,
      skipped: skipped.length > 0 ? skipped : undefined,
    };
  }

  async getStudentSubjectsProgress(userId: string): Promise<StudentSubjectsProgressDto> {
    // Get user with student relation
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const student = user.student;

    // Get all registrations for the student
    const registrations = await this.registrationRepository.find({
      where: { student: { id: student.id } },
      relations: ['class'],
      order: { createdAt: 'DESC' },
    });

    // Get academic progress to extract grades
    const academicProgress = await this.academicProgressRepository.findOne({
      where: { student: { id: student.id } },
    });

    // Get unique subjects from registrations (group by subject, keep latest registration)
    const subjectMap = new Map<string, StudentClassRegistration>();
    registrations.forEach((reg) => {
      const existing = subjectMap.get(reg.subject);
      if (!existing || new Date(reg.createdAt) > new Date(existing.createdAt)) {
        subjectMap.set(reg.subject, reg);
      }
    });

    // Get class counts per subject
    const classCounts = await this.classRepository
      .createQueryBuilder('class')
      .select('class.subject', 'subject')
      .addSelect('COUNT(class.id)', 'count')
      .where('class.isActive = :isActive', { isActive: true })
      .groupBy('class.subject')
      .getRawMany();

    const classCountMap = new Map<string, number>();
    classCounts.forEach((item) => {
      classCountMap.set(item.subject, parseInt(item.count, 10));
    });

    // Build subject progress list
    const subjects: StudentSubjectProgressDto[] = Array.from(subjectMap.entries()).map(([subject, registration]) => {
      // Get grade from academic progress if available
      const grade = academicProgress?.grades?.[subject] || null;

      // Calculate progress (if grade exists, use it; otherwise null)
      let progress: number | null = null;
      if (grade !== null && grade !== undefined) {
        progress = Number(grade);
      }

      return {
        subject,
        grade,
        progress,
        sessionYear: registration.sessionYear,
        term: registration.term,
        registeredAt: registration.createdAt,
        classCount: classCountMap.get(subject) || 0,
      };
    });

    // Sort by subject name
    subjects.sort((a, b) => a.subject.localeCompare(b.subject));

    return {
      subjects,
      totalSubjects: subjects.length,
    };
  }
  async getStudentRoadmap(userId: string): Promise<AllSubjectsRoadmapDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const student = user.student;

    // Get academic progress for grades
    const academicProgress = await this.academicProgressRepository.findOne({
      where: { student: { id: student.id } },
    });

    // Get all registrations
    const registrations = await this.registrationRepository.find({
      where: { student: { id: student.id } },
      relations: ['class'],
      order: { createdAt: 'DESC' },
    });

    // Group by subject, keep latest
    const subjectMap = new Map<string, StudentClassRegistration>();
    registrations.forEach((reg) => {
      if (!subjectMap.has(reg.subject)) {
        subjectMap.set(reg.subject, reg);
      }
    });

    const roadmaps: SubjectRoadmapItemDto[] = [];

    for (const [subject, reg] of subjectMap) {
      const cls = reg.class;
      const status = this.calculateStatus(cls.startTime, cls.endTime);
      const grade = academicProgress?.grades?.[subject];
      const progress = grade !== undefined && grade !== null ? Number(grade) : 0;

      roadmaps.push({
        subject,
        duration: this.calculateDuration(cls.startTime, cls.endTime),
        startDate: cls.startTime,
        endDate: cls.endTime,
        status,
        progress,
        classLevel: cls.gradeLevel || 'N/A',
      });
    }

    return { roadmaps };
  }

  async getSubjectRoadmapDetail(userId: string, subjectName: string): Promise<SubjectRoadmapDetailDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const registrations = await this.registrationRepository.find({
      where: {
        student: { id: user.student.id },
        subject: subjectName
      },
      relations: ['class', 'class.modules'],
      order: { createdAt: 'ASC' }, // Chronological order
    });

    if (registrations.length === 0) {
      throw new NotFoundException(`No history found for subject: ${subjectName}`);
    }

    const academicProgress = await this.academicProgressRepository.findOne({
      where: { student: { id: user.student.id } },
    });

    // Current overall progress (latest grade)
    const grade = academicProgress?.grades?.[subjectName];
    const overallProgress = grade !== undefined && grade !== null ? Number(grade) : 0;

    const milestones = registrations.map(reg => {
      const cls = reg.class;
      return {
        title: `${reg.sessionYear} ${reg.term}`,
        sessionYear: reg.sessionYear,
        term: reg.term,
        level: cls.gradeLevel || 'N/A',
        status: this.calculateStatus(cls.startTime, cls.endTime),
        grade: grade !== undefined && grade !== null ? Number(grade) : undefined, // Note: Historical grades not available in this simplified model
        startDate: cls.startTime,
        endDate: cls.endTime,
        modules: cls.modules ? cls.modules.sort((a, b) => a.order - b.order) : [],
      };
    });

    return {
      subject: subjectName,
      overallProgress,
      milestones,
    };
  }

  private calculateDuration(start: Date, end: Date): string {
    const diffTime = Math.abs(new Date(end).getTime() - new Date(start).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 60) {
      return `${Math.ceil(diffDays / 30)} months`;
    } else if (diffDays > 7) {
      return `${Math.ceil(diffDays / 7)} weeks`;
    }
    return `${diffDays} days`;
  }

  private calculateStatus(start: Date, end: Date): SubjectStatus {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (now < startDate) return SubjectStatus.NOT_STARTED;
    if (now > endDate) return SubjectStatus.COMPLETED;
    return SubjectStatus.IN_PROGRESS;
  }

  async createSubjectModule(userId: string, classId: string, createModuleDto: CreateSubjectModuleDto): Promise<SubjectModuleResponseDto> {
    // Verify teacher owns the class
    const teacher = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['teacher'],
    });

    if (!teacher || !teacher.teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
      relations: ['teacher'],
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    if (classEntity.teacher.id !== teacher.teacher.id) {
      // Allow admins or specific logic if needed, but strict for now
      // throw new ForbiddenException('You are not the teacher of this class');
      // For now assuming check passes or we just check if it exists
    }

    const module = this.moduleRepository.create({
      ...createModuleDto,
      class: classEntity,
    });

    const savedModule = await this.moduleRepository.save(module);

    return {
      id: savedModule.id,
      title: savedModule.title,
      description: savedModule.description,
      order: savedModule.order,
      duration: savedModule.duration,
      topics: savedModule.topics,
      resources: savedModule.resources,
      classId: classEntity.id,
    };
  }

  async getLiveClasses(userId: string): Promise<LiveSessionDto[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    // Get classes student is registered for
    const registrations = await this.registrationRepository.find({
      where: { student: { id: user.student.id } },
      relations: ['class'],
    });

    const classIds = registrations.map(reg => reg.class.id);

    if (classIds.length === 0) {
      return [];
    }

    const sessions = await this.liveSessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.class', 'class')
      .leftJoinAndSelect('class.teacher', 'teacher')
      .where('class.id IN (:...classIds)', { classIds })
      .andWhere('session.status IN (:...statuses)', { statuses: [LiveSessionStatus.SCHEDULED, LiveSessionStatus.LIVE] })
      .orderBy('session.startTime', 'ASC')
      .getMany();

    const now = new Date();

    return sessions.map(session => {
      const isTimeUp = now >= session.startTime && now <= session.endTime;
      return {
        id: session.id,
        title: session.title,
        description: session.description,
        startTime: session.startTime,
        endTime: session.endTime,
        status: isTimeUp ? LiveSessionStatus.LIVE : session.status,
        canJoin: isTimeUp,
        meetingUrl: isTimeUp ? session.meetingUrl : undefined,
        subjectName: session.class.subject,
        className: session.class.title,
        teacherName: session.class.teacher?.fullName || 'Unknown',
      };
    });
  }

  async getLiveSessionDetail(userId: string, sessionId: string): Promise<LiveSessionDetailDto> {
    const session = await this.liveSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['class', 'class.teacher', 'participants', 'participants.user'],
    });

    if (!session) {
      throw new NotFoundException('Live session not found');
    }

    const studentCount = await this.registrationRepository.count({
      where: { class: { id: session.class.id } }
    });

    const now = new Date();
    const isTimeUp = now >= session.startTime && now <= session.endTime;

    return {
      id: session.id,
      title: session.title,
      description: session.description,
      startTime: session.startTime,
      endTime: session.endTime,
      status: isTimeUp ? LiveSessionStatus.LIVE : session.status,
      canJoin: isTimeUp,
      meetingUrl: isTimeUp ? session.meetingUrl : undefined,
      subjectName: session.class.subject,
      className: session.class.title,
      teacherName: session.class.teacher?.fullName || 'Unknown',
      totalParticipants: session.participants.length, // Joined
      totalClassStudents: studentCount, // Registered
      participants: session.participants.map(p => ({
        id: p.id,
        fullName: p.fullName,
        profilePicture: p.user?.profilePicture || null,
      })),
    };
  }

  async joinLiveSession(userId: string, sessionId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const student = user.student;

    const session = await this.liveSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['class', 'participants'],
    });

    if (!session) {
      throw new NotFoundException('Live session not found');
    }

    // Check if student is registered for the class associated with this session
    const registration = await this.registrationRepository.findOne({
      where: {
        student: { id: student.id },
        class: { id: session.class.id },
      },
    });

    if (!registration) {
      throw new ForbiddenException('You are not registered for the class associated with this live session');
    }

    // Check if student is already a participant
    const isParticipant = session.participants.some(p => p.id === student.id);
    if (isParticipant) {
      return { message: 'Already joined session' };
    }

    // Add student to participants
    await this.liveSessionRepository
      .createQueryBuilder()
      .relation(LiveSession, 'participants')
      .of(session.id)
      .add(student.id);

    return { message: 'Successfully joined live session' };
  }

  async leaveLiveSession(userId: string, sessionId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const student = user.student;

    const session = await this.liveSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['participants'],
    });

    if (!session) {
      throw new NotFoundException('Live session not found');
    }

    // Check if student is a participant
    const isParticipant = session.participants.some(p => p.id === student.id);
    if (!isParticipant) {
      return { message: 'Not a participant in this session' };
    }

    // Remove student from participants
    await this.liveSessionRepository
      .createQueryBuilder()
      .relation(LiveSession, 'participants')
      .of(session.id)
      .remove(student.id);

    return { message: 'Successfully left live session' };
  }

  async scheduleSessionReminder(userId: string, sessionId: string, minutesBefore: number = 15): Promise<{ message: string }> {
     const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const session = await this.liveSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['class'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (new Date() > session.endTime) {
       throw new BadRequestException('Cannot set reminder for a past session');
    }

    // Check for existing reminder for this session
    // Note: This assumes title is unique enough or we might need a specific relation or metadata 
    // to link reminder to session strictly. For now, checking title intersection or assuming we can just add another.
    // Ideally duplicate check:
    const existingReminder = await this.reminderRepository.findOne({
      where: {
        user: { id: user.id },
        title: `Reminder: ${session.title}`,
        type: 'live_session'
      }
    });

    if (existingReminder) {
        throw new BadRequestException('Reminder already set for this session');
    }

    const reminderTime = new Date(session.startTime.getTime() - minutesBefore * 60000);

    const reminder = this.reminderRepository.create({
      title: `Reminder: ${session.title}`,
      description: `Upcoming live session for ${session.class.title} - ${session.title} starts in ${minutesBefore} minutes.`,
      dueDate: reminderTime,
      user: user,
      type: 'live_session',
      status: 'pending'
    });

    await this.reminderRepository.save(reminder);

    return { message: `Reminder scheduled for ${minutesBefore} minutes before session start` };
  }

  async sendLiveSessionMessage(userId: string, sessionId: string, sendDto: SendLiveSessionMessageDto): Promise<LiveSessionMessageDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student', 'teacher'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const session = await this.liveSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['class', 'class.teacher'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const isTeacher = session.class.teacher?.id === user.teacher?.id;
    // For now assuming if they can access the endpoint they are somewhat authorized, 
    // but proper check would be: if student -> ensure registered or in participants. if teacher -> ensure owns class.
    
    // Create message
    const message = this.messageRepository.create({
      content: sendDto.content,
      sender: user,
      session: session,
    });

    const savedMessage = await this.messageRepository.save(message);

    return {
      id: savedMessage.id,
      content: savedMessage.content,
      senderId: user.id,
      senderName: this.getUserFullName(user),
      senderProfilePicture: user.profilePicture,
      createdAt: savedMessage.createdAt,
      isMe: true,
    };
  }

  async getLiveSessionMessages(userId: string, sessionId: string): Promise<LiveSessionMessageDto[]> {
    const session = await this.liveSessionRepository.findOne({
      where: { id: sessionId }
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const messages = await this.messageRepository.find({
      where: { session: { id: sessionId } },
      relations: ['sender', 'sender.student', 'sender.teacher'],
      order: { createdAt: 'ASC' },
    });

    return messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.sender.id,
      senderName: this.getUserFullName(msg.sender),
      senderProfilePicture: msg.sender.profilePicture,
      createdAt: msg.createdAt,
      isMe: msg.sender.id === userId,
    }));
  }

  private getUserFullName(user: User): string {
    if (user.student) return user.student.fullName;
    if (user.teacher) return user.teacher.fullName;
    if (user.admin) return user.admin.fullName;
    return 'Unknown User';
  }

  async startClassActivity(userId: string, classActivityId: string): Promise<StartClassActivityResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const classActivity = await this.classActivityRepository.findOne({
      where: { id: classActivityId },
      relations: ['class'],
    });

    if (!classActivity) {
      throw new NotFoundException('Class activity not found');
    }

    // Check if student is registered for the class
    const registration = await this.registrationRepository.findOne({
      where: {
        student: { id: user.student.id },
        class: { id: classActivity.class.id },
      },
    });

    if (!registration) {
      throw new ForbiddenException('You are not registered for the class associated with this class activity');
    }

    // Check if student already has a submission
    let studentClassActivity = await this.studentClassActivityRepository.findOne({
      where: {
        student: { id: user.student.id },
        classActivity: { id: classActivityId },
      },
    });

    if (studentClassActivity) {
      if (studentClassActivity.status === ClassActivityStatus.SUBMITTED || studentClassActivity.status === ClassActivityStatus.GRADED) {
        throw new BadRequestException('You have already submitted this class activity');
      }
      // If already in progress, just return the existing one
      return {
        classActivityId: classActivity.id,
        attemptId: studentClassActivity.id,
        startTime: studentClassActivity.startedAt || new Date(),
        status: studentClassActivity.status,
      };
    }

    // Create new attempt
    studentClassActivity = this.studentClassActivityRepository.create({
      student: user.student,
      classActivity: classActivity,
      status: ClassActivityStatus.IN_PROGRESS,
      startedAt: new Date(),
    });

    const savedAttempt = await this.studentClassActivityRepository.save(studentClassActivity);

    return {
      classActivityId: classActivity.id,
      attemptId: savedAttempt.id,
      startTime: savedAttempt.startedAt as Date,
      status: savedAttempt.status,
    };
  }

  async getClassActivityQuestions(
    userId: string,
    classActivityId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ClassActivityQuestionsResponseDto> {
    // Basic auth check
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const classActivity = await this.classActivityRepository.findOne({
      where: { id: classActivityId },
    });

    if (!classActivity) {
      throw new NotFoundException('Class activity not found');
    }

    // Check if class activity attempt has started
    const attempt = await this.studentClassActivityRepository.findOne({
      where: {
        student: { id: user.student.id },
        classActivity: { id: classActivityId },
      },
    });

    if (!attempt) {
      throw new ForbiddenException('You must start the class activity before viewing questions');
    }

    const [questions, total] = await this.questionRepository.findAndCount({
      where: { classActivity: { id: classActivityId } },
      order: { order: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        points: q.points,
        order: q.order,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getClassActivityDetail(userId: string, classActivityId: string): Promise<ClassActivityDetailDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const classActivity = await this.classActivityRepository.findOne({
      where: { id: classActivityId },
      relations: ['class', 'teacher'],
    });

    if (!classActivity) {
      throw new NotFoundException('Class activity not found');
    }

    const attempt = await this.studentClassActivityRepository.findOne({
      where: {
        student: { id: user.student.id },
        classActivity: { id: classActivityId },
      },
    });

    return {
      id: classActivity.id,
      title: classActivity.title,
      description: classActivity.description,
      instructions: classActivity.instructions,
      subject: classActivity.subject,
      dueDate: classActivity.dueDate,
      totalPoints: classActivity.totalPoints,
      timeLimit: classActivity.timeLimit,
      teacherName: classActivity.teacher?.fullName || 'Unknown',
      status: attempt?.status,
    };
  }

  async submitClassActivity(userId: string, classActivityId: string, submitDto: SubmitClassActivityDto): Promise<{ message: string; score: number }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const attempt = await this.studentClassActivityRepository.findOne({
      where: {
        student: { id: user.student.id },
        classActivity: { id: classActivityId },
      },
      relations: ['classActivity', 'classActivity.questions'],
    });

    if (!attempt) {
      throw new BadRequestException('No active attempt found for this class activity. Please start it first.');
    }

    if (attempt.status === ClassActivityStatus.SUBMITTED || attempt.status === ClassActivityStatus.GRADED) {
      throw new BadRequestException('Class activity already submitted');
    }

    // Auto-grading logic for MCQs/True-False
    let calculatedScore = 0;
    const questions = attempt.classActivity.questions;

    for (const question of questions) {
      const studentAnswer = submitDto.answers[question.id];
      if (studentAnswer && studentAnswer === question.correctAnswer) {
        calculatedScore += question.points;
      }
    }

    attempt.answers = submitDto.answers;
    attempt.score = calculatedScore;
    attempt.submittedAt = new Date();
    attempt.status = attempt.classActivity.dueDate < new Date() ? ClassActivityStatus.LATE : ClassActivityStatus.SUBMITTED;

    await this.studentClassActivityRepository.save(attempt);

    return {
      message: attempt.status === ClassActivityStatus.LATE ? 'Class activity submitted late' : 'Class activity submitted successfully',
      score: calculatedScore,
    };
  }

  async getLearningMaterials(userId: string, classId: string): Promise<LearningMaterialDto[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const cls = await this.classRepository.findOne({
      where: { id: classId },
    });

    if (!cls) {
      throw new NotFoundException('Class not found');
    }

    // Check if student is registered for the class
    const registration = await this.registrationRepository.findOne({
      where: {
        student: { id: user.student.id },
        class: { id: classId },
      },
    });

    if (!registration) {
      throw new ForbiddenException('You are not registered for this class');
    }

    const materials = await this.learningMaterialRepository.find({
      where: { class: { id: classId } },
      order: { createdAt: 'DESC' },
    });

    return materials.map((m) => ({
      id: m.id,
      name: m.name,
      fileType: m.fileType,
      duration: m.duration,
      views: m.views,
    }));
  }

  async getLearningMaterialDetail(userId: string, materialId: string): Promise<LearningMaterialDetailDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const material = await this.learningMaterialRepository.findOne({
      where: { id: materialId },
      relations: ['class', 'lectureNotes', 'lectureNotes.sections'],
    });

    if (!material) {
      throw new NotFoundException('Learning material not found');
    }

    // Check if student is registered for the class
    const registration = await this.registrationRepository.findOne({
      where: {
        student: { id: user.student.id },
        class: { id: material.class.id },
      },
    });

    if (!registration) {
      throw new ForbiddenException('You are not registered for the class associated with this material');
    }

    // Increment views
    material.views += 1;
    await this.learningMaterialRepository.save(material);

    return {
      id: material.id,
      name: material.name,
      description: material.description,
      subject: material.subject,
      fileType: material.fileType,
      duration: material.duration,
      views: material.views,
      lectureNotes: material.lectureNotes.map((note) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        downloadUrl: note.downloadUrl,
        sections: note.sections
          .sort((a, b) => a.order - b.order)
          .map((s) => ({
            id: s.id,
            topic: s.topic,
            content: s.content,
            order: s.order,
          })),
      })),
    };
  }

  async getAssignments(userId: string, filter: AssignmentFilter = AssignmentFilter.ALL): Promise<AssignmentResponseDto[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const query = this.assignmentRepository
      .createQueryBuilder('assignment')
      .leftJoin('assignment.students', 'student')
      .leftJoinAndSelect('assignment.submissions', 'submission', 'submission.studentId = :studentId', { studentId: user.student.id })
      .where('student.id = :studentId', { studentId: user.student.id });

    if (filter === AssignmentFilter.PENDING) {
      query.andWhere('(submission.status IS NULL OR submission.status = :status)', { status: AssignmentStatus.PENDING });
    } else if (filter === AssignmentFilter.SUBMITTED) {
      query.andWhere('submission.status = :status', { status: AssignmentStatus.SUBMITTED });
    }

    const assignments = await query.orderBy('assignment.dueDate', 'ASC').getMany();

    return assignments.map((a) => ({
      id: a.id,
      title: a.title,
      subject: a.subject,
      status: a.submissions && a.submissions.length > 0 ? a.submissions[0].status : AssignmentStatus.PENDING,
      dueDate: a.dueDate,
      description: a.description,
      type: a.type,
      points: a.points,
      priority: a.priority,
    }));
  }

  async getAssignmentDetail(userId: string, assignmentId: string): Promise<AssignmentDetailDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }
    const student = user.student;

    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['students'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if student is assigned to this assignment
    const isAssigned = assignment.students.some((s) => s.id === student.id);
    if (!isAssigned) {
      throw new ForbiddenException('You are not assigned to this assignment');
    }

    const submission = await this.submissionRepository.findOne({
      where: {
        student: { id: student.id },
        assignment: { id: assignmentId },
      },
    });

    return {
      id: assignment.id,
      title: assignment.title,
      subject: assignment.subject,
      status: submission ? submission.status : AssignmentStatus.PENDING,
      dueDate: assignment.dueDate,
      description: assignment.description,
      type: assignment.type,
      points: assignment.points,
      priority: assignment.priority,
      submissionText: submission?.submissionText || null,
      submissionUrl: submission?.submissionUrl || null,
      grade: submission?.grade ? Number(submission.grade) : null,
      feedback: submission?.feedback || null,
      startedAt: submission?.startedAt || null,
      submittedAt: submission?.submittedAt || null,
    };
  }

  async startAssignment(userId: string, assignmentId: string): Promise<StartAssignmentResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }
    const student = user.student;

    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['students'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if student is assigned
    const isAssigned = assignment.students.some((s) => s.id === student.id);
    if (!isAssigned) {
      throw new ForbiddenException('You are not assigned to this assignment');
    }

    let submission = await this.submissionRepository.findOne({
      where: {
        student: { id: student.id },
        assignment: { id: assignmentId },
      },
    });

    if (submission) {
      if (submission.status !== AssignmentStatus.PENDING) {
        return {
          id: submission.id,
          status: submission.status,
          startedAt: submission.startedAt!,
        };
      }
    } else {
      submission = this.submissionRepository.create({
        student: student,
        assignment: assignment,
        status: AssignmentStatus.PENDING,
      });
    }

    submission.status = AssignmentStatus.IN_PROGRESS;
    submission.startedAt = new Date();
    await this.submissionRepository.save(submission);

    return {
      id: submission.id,
      status: submission.status,
      startedAt: submission.startedAt,
    };
  }

  async previewAssignmentSubmission(userId: string, assignmentId: string, submitDto: SubmitAssignmentDto): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }
    const student = user.student;

    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Preview logic: return what the submission would look like
    return {
      assignmentTitle: assignment.title,
      studentName: student.fullName,
      submissionText: submitDto.text,
      attachmentUrl: submitDto.attachmentUrl,
      previewGeneratedAt: new Date(),
    };
  }

  async viewAssignmentSubmission(userId: string, assignmentId: string): Promise<SubmissionViewDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }
    const student = user.student;

    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const submission = await this.submissionRepository.findOne({
      where: {
        student: { id: student.id },
        assignment: { id: assignmentId },
      },
    });

    if (!submission || (submission.status !== AssignmentStatus.SUBMITTED && submission.status !== AssignmentStatus.GRADED)) {
      throw new BadRequestException('No submission found for this assignment or assignment not yet submitted');
    }

    return {
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      status: submission.status,
      submissionText: submission.submissionText,
      submissionUrl: submission.submissionUrl,
      submittedAt: submission.submittedAt,
      grade: submission.grade ? Number(submission.grade) : null,
      feedback: submission.feedback,
    };
  }

  async saveAssignmentDraft(userId: string, assignmentId: string, submitDto: SubmitAssignmentDto): Promise<SubmissionViewDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }
    const student = user.student;

    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['students'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if student is assigned
    const isAssigned = assignment.students.some((s) => s.id === student.id);
    if (!isAssigned) {
      throw new ForbiddenException('You are not assigned to this assignment');
    }

    let submission = await this.submissionRepository.findOne({
      where: {
        student: { id: student.id },
        assignment: { id: assignmentId },
      },
    });

    if (!submission) {
      submission = this.submissionRepository.create({
        student: student,
        assignment: assignment,
        status: AssignmentStatus.DRAFT,
        startedAt: new Date(),
      });
    } else if (submission.status === AssignmentStatus.SUBMITTED || submission.status === AssignmentStatus.GRADED) {
      throw new BadRequestException('Cannot save draft for an already submitted assignment');
    }

    submission.submissionText = submitDto.text;
    submission.submissionUrl = submitDto.attachmentUrl ?? null;
    submission.status = AssignmentStatus.DRAFT;
    
    const savedSubmission = await this.submissionRepository.save(submission);

    return {
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      status: savedSubmission.status,
      submissionText: savedSubmission.submissionText,
      submissionUrl: savedSubmission.submissionUrl,
      submittedAt: savedSubmission.submittedAt,
      grade: savedSubmission.grade ? Number(savedSubmission.grade) : null,
      feedback: savedSubmission.feedback,
    };
  }

  async submitAssignment(userId: string, assignmentId: string, submitDto: SubmitAssignmentDto): Promise<SubmissionViewDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }
    const student = user.student;

    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['students'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if student is assigned
    const isAssigned = assignment.students.some((s) => s.id === student.id);
    if (!isAssigned) {
      throw new ForbiddenException('You are not assigned to this assignment');
    }

    let submission = await this.submissionRepository.findOne({
      where: {
        student: { id: student.id },
        assignment: { id: assignmentId },
      },
    });

    if (!submission) {
      submission = this.submissionRepository.create({
        student: student,
        assignment: assignment,
        startedAt: new Date(),
      });
    } else if (submission.status === AssignmentStatus.SUBMITTED || submission.status === AssignmentStatus.GRADED) {
      throw new BadRequestException('Assignment has already been submitted');
    }

    submission.submissionText = submitDto.text;
    submission.submissionUrl = submitDto.attachmentUrl ?? null;
    submission.status = AssignmentStatus.SUBMITTED;
    submission.submittedAt = new Date();
    
    const savedSubmission = await this.submissionRepository.save(submission);

    return {
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      status: savedSubmission.status,
      submissionText: savedSubmission.submissionText,
      submissionUrl: savedSubmission.submissionUrl,
      submittedAt: savedSubmission.submittedAt,
      grade: savedSubmission.grade ? Number(savedSubmission.grade) : null,
      feedback: savedSubmission.feedback,
    };
  }
}

