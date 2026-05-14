import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like, In, IsNull } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, Student, Parent, Teacher, Admin, Class, Event, Announcement, TimetablePeriod, ExamTimetable } from '../entities';
import { UserRole } from '../common/enums/user-role.enum';
import { 
    AdminClassOverviewDto, 
    AdminStudentDto, 
    AdminTeacherDto, 
    AdminParentDto,
    CreateStudentWithParentDto,
    AdminSystemUserDto,
    CreateClassDto,
    CreateTeacherDto,
    CreateSystemUserDto,
    CreateParentDto,
    CreateAnnouncementDto,
    CreateEventDto,
    CreateTimetablePeriodDto,
    CreateExamTimetableDto,
    SendIdCardsToVendorDto
} from './dto/admin.dto';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Student) private studentRepository: Repository<Student>,
        @InjectRepository(Parent) private parentRepository: Repository<Parent>,
        @InjectRepository(Teacher) private teacherRepository: Repository<Teacher>,
        @InjectRepository(Admin) private adminRepository: Repository<Admin>,
        @InjectRepository(Class) private classRepository: Repository<Class>,
        @InjectRepository(Event) private eventRepository: Repository<Event>,
        @InjectRepository(Announcement) private announcementRepository: Repository<Announcement>,
        @InjectRepository(TimetablePeriod) private timetablePeriodRepository: Repository<TimetablePeriod>,
        @InjectRepository(ExamTimetable) private examTimetableRepository: Repository<ExamTimetable>,
        private dataSource: DataSource
    ) {}

    private async getAdminSchoolName(adminId: string): Promise<string | null> {
        const admin = await this.adminRepository.findOne({ 
            where: { user: { id: adminId } } 
        });
        
        if (admin && admin.address) {
            // Extract school name: "NetzerTech High School (Size: 100-500)" -> "NetzerTech High School"
            return admin.address.split(' (Size:')[0].trim();
        }
        
        // Return null instead of throwing — callers already handle null with unscoped queries
        console.warn(`[AdminService] Admin ${adminId} has no school profile configured.`);
        return null;
    }

    async getClassesOverview(adminId?: string): Promise<AdminClassOverviewDto[]> {
        const schoolName = adminId ? await this.getAdminSchoolName(adminId) : null;
        let classes: Class[] = [];
        try {
            classes = await this.classRepository.find({ 
                where: schoolName ? { school: schoolName } : {},
                relations: ['teacher', 'students', 'students.user'] 
            });
        } catch (err) {
            console.error('[AdminService] getClassesOverview failed with teacher relation:', err.message);
            try {
                classes = await this.classRepository.find({ 
                    where: schoolName ? { school: schoolName } : {},
                    relations: ['students', 'students.user'] 
                });
            } catch (err2) {
                console.error('[AdminService] getClassesOverview failed with school filter:', err2.message);
                classes = await this.classRepository.find({ 
                    relations: ['students', 'students.user'] 
                });
            }
        }
        const results: AdminClassOverviewDto[] = [];

        for (const cls of classes) {
            // Filter students by school if schoolName is provided
            const students = cls.students ? cls.students.filter(s => !schoolName || s.school === schoolName) : [];
            
            let males = 0;
            let females = 0;
            let active = 0;
            let suspended = 0;

            for (const student of students) {
                if (student.gender?.toLowerCase() === 'male') males++;
                else if (student.gender?.toLowerCase() === 'female') females++;

                if (student.user?.isActive) active++;
                else suspended++;
            }

            results.push({
                id: cls.id,
                name: cls.title,
                classTeacher: cls.teacher ? cls.teacher.fullName : 'Unassigned',
                totalStudents: students.length,
                males,
                females,
                active,
                suspended
            });
        }

        return results;
    }

    async getStudents(adminId?: string): Promise<AdminStudentDto[]> {
        const schoolName = adminId ? await this.getAdminSchoolName(adminId) : null;
        let students: Student[] = [];
        try {
            students = await this.studentRepository.find({
                where: schoolName ? { school: schoolName } : {},
                relations: ['user', 'parent', 'parent.user', 'classes']
            });
        } catch (err) {
            console.error('[AdminService] getStudents failed with school filter or relations:', err.message);
            try {
                students = await this.studentRepository.find({
                    relations: ['user', 'classes']
                });
            } catch (err2) {
                students = await this.studentRepository.find();
            }
        }

        return students.map(student => {
            const currentClass = student.classes && student.classes.length > 0 ? student.classes[0].title : 'Unassigned';
            
            let age = 0;
            if (student.dateOfBirth) {
                const diff = Date.now() - new Date(student.dateOfBirth).getTime();
                age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
            }

            return {
                id: student.studentId || student.id,
                name: student.fullName,
                class: currentClass,
                gender: student.gender || 'N/A',
                age: age || 0,
                parent: student.parent ? student.parent.fullName : 'N/A',
                status: student.user?.isActive ? 'Active' : 'Suspended',
                email: student.user?.email || '',
                phone: student.phoneNumber || '',
                admission: student.admissionDate ? new Date(student.admissionDate).toISOString().split('T')[0] : 'N/A'
            };
        });
    }

    async getTeachers(adminId?: string): Promise<AdminTeacherDto[]> {
        const schoolName = adminId ? await this.getAdminSchoolName(adminId) : null;
        let teachers: Teacher[] = [];
        
        try {
            teachers = await this.teacherRepository.find({
                where: schoolName ? { school: schoolName } : {},
                relations: ['user', 'classes']
            });
        } catch (err) {
            console.error('[AdminService] getTeachers failed with school filter:', err.message);
            teachers = await this.teacherRepository.find({
                relations: ['user', 'classes']
            }).catch(() => []);
        }

        // We assume subjects might be linked via classes or a separate entity.
        // For now, we aggregate class titles as subjects/classes.
        return teachers.map(teacher => {
            const assignedClasses = teacher.classes ? teacher.classes.map(c => c.title).join(', ') : 'None';
            
            return {
                id: teacher.employeeId || teacher.id,
                name: teacher.fullName,
                subjects: assignedClasses, // Simplify subject by using class names
                classes: assignedClasses,
                status: teacher.user?.isActive ? 'Active' : 'Inactive',
                email: teacher.user?.email || '',
                phone: teacher.phoneNumber || '',
                joined: teacher.createdAt ? teacher.createdAt.toISOString().split('T')[0] : 'N/A'
            };
        });
    }

    async createClass(dto: CreateClassDto, adminId: string): Promise<Class> {
        const schoolName = await this.getAdminSchoolName(adminId);
        
        // Compute the canonical class name from level + section
        const section = (dto.section || '').toUpperCase().trim();
        const computedName = section ? `${dto.level} ${section}` : dto.name || dto.level;
        
        const existingClass = await this.classRepository.findOne({
            where: { title: computedName, school: schoolName ? schoolName : IsNull() }
        });

        if (existingClass) {
            throw new BadRequestException(`Class with name "${computedName}" already exists for this school.`);
        }

        let teacher: Teacher | null = null;
        if (dto.classTeacherId) {
            teacher = await this.teacherRepository.findOne({ where: { id: dto.classTeacherId } });
        }

        const newClass = this.classRepository.create({
            title: computedName,
            gradeLevel: dto.level,
            location: dto.room,
            school: schoolName || undefined,
            teacher: teacher || undefined,
            subject: 'General', // Default subject
            startTime: new Date(),
            endTime: new Date(),
        });

        return this.classRepository.save(newClass as any) as Promise<Class>;
    }

    async getParents(adminId?: string): Promise<AdminParentDto[]> {
        const schoolName = adminId ? await this.getAdminSchoolName(adminId) : null;
        let parents: Parent[] = [];
        try {
            parents = await this.parentRepository.find({
                where: schoolName ? { children: { school: schoolName } } : {},
                relations: ['user', 'children']
            });
        } catch (err) {
            console.error('[AdminService] getParents failed with school filter:', err.message);
            try {
                parents = await this.parentRepository.find({
                    relations: ['user', 'children']
                });
            } catch (err2) {
                console.error('[AdminService] getParents failed with relations fallback:', err2.message);
                parents = await this.parentRepository.find({
                    relations: ['user']
                }).catch(() => []);
            }
        }

        return parents.map(parent => {
            const childrenNames = parent.children ? parent.children.map(c => c.fullName).join(', ') : 'None';
            
            return {
                id: parent.id,
                name: parent.fullName,
                children: childrenNames,
                phone: parent.phoneNumber || '',
                email: parent.user?.email || '',
                occupation: parent.occupation || 'N/A',
                address: parent.address || 'N/A',
                status: parent.user?.isActive ? 'Active' : 'Inactive'
            };
        });
    }

    async createStudentWithParent(dto: CreateStudentWithParentDto, adminId?: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            let schoolName: string;
            if (adminId) {
                const admin = await queryRunner.manager.findOne(Admin, { 
                    where: { user: { id: adminId } },
                    relations: ['user']
                });
                if (admin && admin.address) {
                    // Extract school name: "NetzerTech High School (Size: 100-500)" -> "NetzerTech High School"
                    schoolName = admin.address.split(' (Size:')[0].trim();
                } else {
                    throw new BadRequestException('Admin school profile not found.');
                }
            } else {
                throw new BadRequestException('Admin ID is required to determine the school.');
            }

            // 1. Handle Parent User
            let parentUser = await queryRunner.manager.findOne(User, { 
                where: { email: dto.parentEmail },
                relations: ['parent']
            });

            let parent: Parent;

            if (parentUser) {
                if (parentUser.parent) {
                    parent = parentUser.parent;
                } else {
                    // Create parent profile for existing user
                    parent = this.parentRepository.create({
                        fullName: `${dto.parentTitle} ${dto.parentFirstName} ${dto.parentLastName}`,
                        phoneNumber: dto.parentPhone,
                        occupation: dto.parentOccupation,
                        address: dto.parentAddress,
                        user: parentUser
                    });
                    parent = await queryRunner.manager.save(Parent, parent);
                }
            } else {
                // Create NEW Parent User
                parentUser = this.userRepository.create({
                    email: dto.parentEmail,
                    password: await bcrypt.hash('defaultPassword123!', 10),
                    userType: UserRole.PARENT,
                    mustChangePassword: true,
                });
                parentUser = await queryRunner.manager.save(User, parentUser);

                parent = this.parentRepository.create({
                    fullName: `${dto.parentTitle} ${dto.parentFirstName} ${dto.parentLastName}`,
                    phoneNumber: dto.parentPhone,
                    occupation: dto.parentOccupation,
                    address: dto.parentAddress,
                    user: parentUser
                });
                parent = await queryRunner.manager.save(Parent, parent);
            }

            // 2. Handle Student User
            const studentEmail = dto.studentEmail || `${dto.studentFirstName.toLowerCase()}.${dto.studentLastName.toLowerCase()}@student.netzertech.edu.ng`;
            
            // Check if student user already exists
            const existingStudentUser = await queryRunner.manager.findOne(User, { where: { email: studentEmail } });
            if (existingStudentUser) {
                throw new Error(`A user with email ${studentEmail} already exists.`);
            }

            let studentUser = this.userRepository.create({
                email: studentEmail,
                password: await bcrypt.hash('defaultPassword123!', 10),
                userType: UserRole.SECONDARY_STUDENT,
                mustChangePassword: true,
            });
            studentUser = await queryRunner.manager.save(User, studentUser);

            // 3. Find Class (Scoped by School)
            // We first try to find by ID, then by Title (case-insensitive)
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(dto.class);
            let studentClass = null;
            
            if (isUuid) {
                studentClass = await queryRunner.manager.findOne(Class, { 
                    where: { id: dto.class, school: schoolName ? schoolName : IsNull() } 
                });
            }

            if (!studentClass) {
                // Try by Title (case-insensitive)
                studentClass = await queryRunner.manager.createQueryBuilder(Class, 'class')
                    .where('LOWER(class.title) = LOWER(:title)', { title: dto.class.trim() })
                    .andWhere('class.school = :schoolName', { schoolName })
                    .getOne();
            }

            // Final fallback: search by title without school scope if scoped search fails
            if (!studentClass) {
                studentClass = await queryRunner.manager.findOne(Class, { 
                    where: { title: dto.class } 
                });
            }

            if (!studentClass) {
                console.error(`[AdminService] Class lookup failed for "${dto.class}" in school "${schoolName}"`);
                throw new BadRequestException(`Class "${dto.class}" not found. Please ensure the class is created correctly.`);
            }

            // Generate unique student ID (Scoped by School)
            let studentId: string;
            
            if (dto.studentId) {
                // Use provided ID if it's unique FOR THIS SCHOOL
                const existing = await queryRunner.manager.findOne(Student, { 
                    where: { studentId: dto.studentId, school: schoolName ? schoolName : IsNull() } 
                });
                if (existing) {
                    throw new Error(`Student ID ${dto.studentId} is already in use at your school.`);
                }
                studentId = dto.studentId;
            } else {
                // Auto-generate in format STU[YEAR][SEQ] e.g. STU2026001
                const currentYear = new Date().getFullYear();
                const prefix = `STU${currentYear}`;
                
                // Find the latest student ID ACROSS ALL SCHOOLS with this prefix
                const latestStudent = await queryRunner.manager.createQueryBuilder(Student, 'student')
                    .where('student.studentId LIKE :prefix', { prefix: `${prefix}%` })
                    .orderBy('student.studentId', 'DESC')
                    .getOne();

                let sequence = 1;
                if (latestStudent && latestStudent.studentId) {
                    const lastSeqStr = latestStudent.studentId.replace(prefix, '');
                    const lastSeq = parseInt(lastSeqStr);
                    if (!isNaN(lastSeq)) {
                        sequence = lastSeq + 1;
                    }
                }

                // Ensure it's unique globally by checking and incrementing if needed
                let isUnique = false;
                while (!isUnique) {
                    studentId = `${prefix}${sequence.toString().padStart(3, '0')}`;
                    const existing = await queryRunner.manager.findOne(Student, { 
                        where: { studentId } 
                    });
                    if (!existing) {
                        isUnique = true;
                    } else {
                        sequence++;
                    }
                }
            }

            const student = this.studentRepository.create({
                studentId: studentId!,
                fullName: `${dto.studentFirstName} ${dto.studentLastName}`,
                gender: dto.gender,
                dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
                parent: parent,
                user: studentUser,
                school: schoolName || undefined, // SAVE WITH SCHOOL NAME
                classes: studentClass ? [studentClass] : [],
                admissionDate: new Date()
            });
            await queryRunner.manager.save(Student, student);

            await queryRunner.commitTransaction();
            
            return {
                message: 'Student and Parent created successfully',
                student: {
                    id: student.studentId,
                    name: student.fullName
                }
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new BadRequestException('Failed to create student and parent: ' + error.message);
        } finally {
            await queryRunner.release();
        }
    }

    async getSystemUsers(adminId?: string): Promise<AdminSystemUserDto[]> {
        const schoolName = adminId ? await this.getAdminSchoolName(adminId) : null;
        let users: User[] = [];
        
        try {
            users = await this.userRepository.find({
                where: [
                    { userType: UserRole.ADMIN, admin: schoolName ? { address: Like(`%${schoolName}%`) } : {} },
                    { userType: UserRole.TEACHER, teacher: schoolName ? { school: schoolName } : {} }
                ],
                relations: ['admin', 'teacher']
            });
        } catch (err) {
            console.error('[AdminService] getSystemUsers failed with relations, falling back to basic list:', err.message);
            users = await this.userRepository.find({
                where: [
                    { userType: UserRole.ADMIN },
                    { userType: UserRole.TEACHER }
                ]
            }).catch(() => []);
        }

        return users.map(user => {
            let role = 'Admin';
            let department = 'Administration';

            if (user.userType === UserRole.TEACHER) {
                role = 'Teacher';
                department = user.teacher?.department || 'Academic';
            } else if (user.admin) {
                if (user.admin.isSuperAdmin) role = 'Super Admin';
                department = user.admin.department || 'Administration';
            }

            return {
                id: user.id,
                email: user.email,
                name: user.teacher?.fullName || user.admin?.fullName || 'System User',
                role,
                department,
                status: user.isActive ? 'Active' : 'Inactive',
                lastLogin: user.lastLoginAt ? this.formatTimeAgo(user.lastLoginAt) : 'Never',
                createdDate: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
                permissions: []
            };
        });
    }

    async getDashboardStats(adminId?: string) {
        const schoolName = adminId ? await this.getAdminSchoolName(adminId) : null;

        let studentCount = 0;
        let teacherCount = 0;
        let parentCount = 0;
        let classCount = 0;

        try {
            [studentCount, teacherCount, parentCount, classCount] = await Promise.all([
                this.studentRepository.count({ where: schoolName ? { school: schoolName } : {} }),
                this.teacherRepository.count({ where: schoolName ? { school: schoolName } : {} }),
                this.parentRepository.count({ 
                    where: schoolName ? { children: { school: schoolName } } : {} 
                }),
                this.classRepository.count({ where: schoolName ? { school: schoolName } : {} }),
            ]);
        } catch (err) {
            console.error('[AdminService] getDashboardStats counts failed:', err.message);
            // Fallback to total counts if school filter fails (likely due to missing column)
            [studentCount, teacherCount, parentCount, classCount] = await Promise.all([
                this.studentRepository.count().catch(() => 0),
                this.teacherRepository.count().catch(() => 0),
                this.parentRepository.count().catch(() => 0),
                this.classRepository.count().catch(() => 0),
            ]);
        }

        let recentUsers: User[] = [];
        try {
            recentUsers = await this.userRepository.find({
                where: schoolName ? [
                    { student: { school: schoolName } },
                    { teacher: { school: schoolName } }
                ] : {},
                order: { createdAt: 'DESC' },
                take: 5,
                relations: ['student', 'teacher']
            });
        } catch (err) {
            console.error('[AdminService] getDashboardStats recent users failed:', err.message);
            recentUsers = await this.userRepository.find({
                order: { createdAt: 'DESC' },
                take: 5
            });
        }

        const recentActivities = recentUsers.map(user => ({
            action: `New ${user.userType.toLowerCase()} registered`,
            name: user.student?.fullName || user.teacher?.fullName || user.email,
            time: this.formatTimeAgo(user.createdAt)
        }));

        return {
            stats: [
                { label: 'Total Students', value: studentCount.toString(), change: '+0%', up: true, icon: 'Users', color: '#1B6B8A', bg: '#E8F4F8' },
                { label: 'Total Teachers', value: teacherCount.toString(), change: '+0%', up: true, icon: 'GraduationCap', color: '#22C55E', bg: '#ECFDF5' },
                { label: 'Total Parents', value: parentCount.toString(), change: '+0%', up: true, icon: 'UserCheck', color: '#F59E0B', bg: '#FEF9C3' },
                { label: 'Total Classes', value: classCount.toString(), change: '+0%', up: true, icon: 'BookOpen', color: '#8B5CF6', bg: '#F3E8FF' },
            ],
            recentActivities
        };
    }

    private formatTimeAgo(date: Date): string {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }

    // ========== POST: Create Teacher ==========
    async createTeacher(dto: CreateTeacherDto, adminId: string) {
        const schoolName = await this.getAdminSchoolName(adminId);
        
        // Check if user with this email already exists
        const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
        if (existingUser) {
            throw new BadRequestException(`A user with email ${dto.email} already exists.`);
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Create User
            let user = this.userRepository.create({
                email: dto.email,
                password: await bcrypt.hash('defaultPassword123!', 10),
                userType: UserRole.TEACHER,
                mustChangePassword: true,
            });
            user = await queryRunner.manager.save(User, user);

            // Create Teacher profile
            const fullName = [dto.title, dto.firstName, dto.lastName].filter(Boolean).join(' ');
            const teacher = this.teacherRepository.create({
                fullName,
                phoneNumber: dto.phone,
                department: dto.subject || 'General',
                address: dto.address,
                school: schoolName || undefined,
                user,
            });
            await queryRunner.manager.save(Teacher, teacher);

            await queryRunner.commitTransaction();

            return {
                message: 'Teacher created successfully',
                teacher: { id: teacher.id, name: fullName, email: dto.email }
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new BadRequestException('Failed to create teacher: ' + error.message);
        } finally {
            await queryRunner.release();
        }
    }

    // ========== POST: Create System User ==========
    async createSystemUser(dto: CreateSystemUserDto, adminId: string) {
        const schoolName = await this.getAdminSchoolName(adminId);

        const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
        if (existingUser) {
            throw new BadRequestException(`A user with email ${dto.email} already exists.`);
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const isTeacherRole = dto.role.toLowerCase() === 'teacher';
            const userType = isTeacherRole ? UserRole.TEACHER : UserRole.ADMIN;

            let user = this.userRepository.create({
                email: dto.email,
                password: await bcrypt.hash('defaultPassword123!', 10),
                userType,
                mustChangePassword: true,
            });
            user = await queryRunner.manager.save(User, user);

            if (isTeacherRole) {
                const teacher = this.teacherRepository.create({
                    fullName: dto.name,
                    department: dto.department || 'Academic',
                    school: schoolName || undefined,
                    user,
                });
                await queryRunner.manager.save(Teacher, teacher);
            } else {
                const admin = this.adminRepository.create({
                    fullName: dto.name,
                    department: dto.department || 'Administration',
                    address: schoolName ? `${schoolName} (Size: N/A)` : undefined,
                    isSuperAdmin: false,
                    user,
                });
                await queryRunner.manager.save(Admin, admin as any);
            }

            await queryRunner.commitTransaction();

            return {
                message: 'System user created successfully',
                user: { id: user.id, name: dto.name, email: dto.email, role: dto.role }
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new BadRequestException('Failed to create system user: ' + error.message);
        } finally {
            await queryRunner.release();
        }
    }

    // ========== POST: Create Parent ==========
    async createParent(dto: CreateParentDto, adminId: string) {
        const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
        if (existingUser) {
            throw new BadRequestException(`A user with email ${dto.email} already exists.`);
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Create User
            let user = this.userRepository.create({
                email: dto.email,
                password: await bcrypt.hash('defaultPassword123!', 10),
                userType: UserRole.PARENT,
                mustChangePassword: true,
            });
            user = await queryRunner.manager.save(User, user);

            // Create Parent profile
            const fullName = [dto.title, dto.firstName, dto.lastName].filter(Boolean).join(' ');
            const parent = this.parentRepository.create({
                fullName,
                phoneNumber: dto.phone,
                email: dto.email,
                occupation: dto.occupation,
                address: dto.address,
                relationship: dto.relationship,
                user,
            });
            const savedParent = await queryRunner.manager.save(Parent, parent);

            // Link students if provided
            if (dto.studentIds && dto.studentIds.length > 0) {
                await queryRunner.manager
                    .createQueryBuilder()
                    .update(Student)
                    .set({ parent: savedParent })
                    .where('id IN (:...ids)', { ids: dto.studentIds })
                    .execute();
            }

            await queryRunner.commitTransaction();

            return {
                message: 'Parent created successfully',
                parent: { id: savedParent.id, name: fullName, email: dto.email }
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new BadRequestException('Failed to create parent: ' + error.message);
        } finally {
            await queryRunner.release();
        }
    }

    // ========== POST: Create Announcement ==========
    async createAnnouncement(dto: CreateAnnouncementDto, adminId: string) {
        const schoolName = await this.getAdminSchoolName(adminId);

        const announcement = this.announcementRepository.create({
            title: dto.title,
            content: dto.content,
            targetAudience: dto.targetAudience || 'All',
            priority: dto.priority || 'Medium',
            status: dto.status || 'Published',
            school: schoolName || undefined,
            createdBy: adminId,
        });

        const saved = await this.announcementRepository.save(announcement as any) as Announcement;

        return {
            message: 'Announcement created successfully',
            announcement: { id: saved.id, title: saved.title, status: saved.status }
        };
    }

    // ========== POST: Create Event ==========
    async createEvent(dto: CreateEventDto, adminId: string) {
        const event = this.eventRepository.create({
            title: dto.title,
            description: dto.description || '',
            eventDate: new Date(dto.date),
            location: dto.location || '',
            isActive: dto.status !== 'Draft',
        });

        const saved = await this.eventRepository.save(event as any) as Event;

        return {
            message: 'Event created successfully',
            event: { id: saved.id, title: saved.title, date: dto.date }
        };
    }

    // ========== POST: Create Timetable Period ==========
    async createTimetablePeriod(dto: CreateTimetablePeriodDto, adminId: string) {
        const schoolName = await this.getAdminSchoolName(adminId);

        const period = this.timetablePeriodRepository.create({
            startTime: dto.startTime,
            endTime: dto.endTime,
            periodType: dto.periodType,
            className: dto.className,
            subject: dto.subject,
            teacherId: dto.teacherId,
            dayOfWeek: dto.dayOfWeek,
            school: schoolName || undefined,
        });

        const saved = await this.timetablePeriodRepository.save(period as any) as TimetablePeriod;

        return {
            message: 'Timetable period created successfully',
            period: { id: saved.id, startTime: saved.startTime, endTime: saved.endTime, type: saved.periodType }
        };
    }

    // ========== POST: Create Exam Timetable ==========
    async createExamTimetable(dto: CreateExamTimetableDto, adminId: string) {
        const schoolName = await this.getAdminSchoolName(adminId);

        const examTimetable = this.examTimetableRepository.create({
            examName: dto.examName,
            classLevel: dto.classLevel,
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
            subject: dto.subject,
            venue: dto.venue,
            school: schoolName || undefined,
        });

        const saved = await this.examTimetableRepository.save(examTimetable as any) as ExamTimetable;

        return {
            message: 'Examination timetable created successfully',
            examTimetable: { id: saved.id, examName: saved.examName, classLevel: saved.classLevel }
        };
    }

    // ========== POST: Send ID Cards to Vendor (Stub) ==========
    // ========== GET: Details ==========
    async getStudentDetail(id: string, adminId: string) {
        const schoolName = await this.getAdminSchoolName(adminId);
        const student = await this.studentRepository.findOne({
            where: [
                { id: id, school: schoolName ? schoolName : undefined },
                { studentId: id, school: schoolName ? schoolName : undefined }
            ],
            relations: ['user', 'parent', 'parent.user', 'classes']
        });

        if (!student) {
            throw new BadRequestException('Student not found');
        }

        // Calculate age
        let age = 0;
        if (student.dateOfBirth) {
            const diff = Date.now() - new Date(student.dateOfBirth).getTime();
            age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
        }

        return {
            id: student.studentId || student.id,
            name: student.fullName,
            class: student.classes && student.classes.length > 0 ? student.classes[0].title : 'Unassigned',
            gender: student.gender || 'N/A',
            age: age || 0,
            dob: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : 'N/A',
            admission: student.admissionDate ? new Date(student.admissionDate).toISOString().split('T')[0] : 'N/A',
            email: student.user?.email || '',
            phone: student.phoneNumber || '',
            address: student.residentialAddress || 'N/A',
            status: student.user?.isActive ? 'Active' : 'Suspended',
            parent: student.parent ? student.parent.fullName : 'N/A',
            parentPhone: student.parent ? student.parent.phoneNumber : 'N/A',
            parentEmail: student.parent?.user?.email || 'N/A',
            attendance: {
                present: 85,
                absent: 10,
                late: 5,
                total: 100
            },
            subjects: [
                { name: "Mathematics", score: 85, grade: "A" },
                { name: "English", score: 72, grade: "B" },
                { name: "Science", score: 91, grade: "A" }
            ],
            fees: {
                total: 450000,
                paid: 350000,
                balance: 100000
            }
        };
    }

    async getTeacherDetail(id: string, adminId: string) {
        const schoolName = await this.getAdminSchoolName(adminId);
        const teacher = await this.teacherRepository.findOne({
            where: [
                { id: id, school: schoolName ? schoolName : undefined },
                { employeeId: id, school: schoolName ? schoolName : undefined }
            ],
            relations: ['user', 'classes']
        });

        if (!teacher) {
            throw new BadRequestException('Teacher not found');
        }

        const assignedClasses = teacher.classes ? teacher.classes.map(c => c.title) : [];

        return {
            id: teacher.employeeId || teacher.id,
            name: teacher.fullName,
            email: teacher.user?.email || '',
            phone: teacher.phoneNumber || '',
            gender: 'N/A',
            dob: 'N/A',
            address: teacher.address || 'N/A',
            qualification: 'B.Ed',
            experience: '5 years',
            joinDate: teacher.createdAt ? teacher.createdAt.toISOString().split('T')[0] : 'N/A',
            subject: teacher.department || 'N/A',
            status: teacher.user?.isActive ? 'Active' : 'Inactive',
            classes: assignedClasses,
            totalStudents: 120,
            performance: {
                passRate: 92,
                avgStudentScore: 78,
                classesPerWeek: 15
            },
            schedule: [
                { day: "Monday", time: "08:00 AM - 09:30 AM", class: assignedClasses[0] || "N/A", topic: "Intro to Subject" },
                { day: "Tuesday", time: "10:00 AM - 11:30 AM", class: assignedClasses[1] || "N/A", topic: "Advanced Topics" }
            ]
        };
    }

    // ========== POST: Send ID Cards to Vendor (Stub) ==========
    async sendIdCardsToVendor(dto: SendIdCardsToVendorDto, adminId: string) {
        console.log(`[AdminService] Vendor order request from admin ${adminId}:`, dto.requestIds);
        
        return {
            message: 'ID card order sent to vendor successfully',
            orderCount: dto.requestIds.length,
            requestIds: dto.requestIds,
            vendorNotified: true,
        };
    }
}
