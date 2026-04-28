import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User, Student, Parent, Teacher, Admin, Class } from '../entities';
import { UserRole } from '../common/enums/user-role.enum';
import { 
    AdminClassOverviewDto, 
    AdminStudentDto, 
    AdminTeacherDto, 
    AdminParentDto,
    CreateStudentWithParentDto,
    AdminSystemUserDto
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
        private dataSource: DataSource
    ) {}

    private async getAdminSchoolName(adminId: string): Promise<string> {
        const admin = await this.adminRepository.findOne({ 
            where: { user: { id: adminId } } 
        });
        
        if (admin && admin.address) {
            // Extract school name: "NetzerTech High School (Size: 100-500)" -> "NetzerTech High School"
            return admin.address.split(' (Size:')[0];
        }
        
        return 'NetzerTech School'; // Default fallback
    }

    async getClassesOverview(adminId?: string): Promise<AdminClassOverviewDto[]> {
        const schoolName = adminId ? await this.getAdminSchoolName(adminId) : null;
        const classes = await this.classRepository.find({ 
            where: schoolName ? { school: schoolName } : {},
            relations: ['teacher', 'students', 'students.user'] 
        });
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
        const students = await this.studentRepository.find({
            where: schoolName ? { school: schoolName } : {},
            relations: ['user', 'parent', 'parent.user', 'classes']
        });

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
        const teachers = await this.teacherRepository.find({
            where: schoolName ? { school: schoolName } : {},
            relations: ['user', 'classes']
        });

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
        
        const existingClass = await this.classRepository.findOne({
            where: { title: dto.name, school: schoolName }
        });

        if (existingClass) {
            throw new BadRequestException(`Class with name "${dto.name}" already exists for this school.`);
        }

        let teacher = null;
        if (dto.classTeacherId) {
            teacher = await this.teacherRepository.findOne({ where: { id: dto.classTeacherId } });
        }

        const newClass = this.classRepository.create({
            title: dto.name,
            gradeLevel: dto.level,
            location: dto.room,
            school: schoolName,
            teacher: teacher,
            subject: 'General', // Default subject
            startTime: new Date(),
            endTime: new Date(),
        });

        return this.classRepository.save(newClass);
    }

    async getParents(adminId?: string): Promise<AdminParentDto[]> {
        const schoolName = adminId ? await this.getAdminSchoolName(adminId) : null;
        const parents = await this.parentRepository.find({
            where: schoolName ? { children: { school: schoolName } } : {},
            relations: ['user', 'children']
        });

        return parents.map(parent => {
            const childrenNames = parent.children ? parent.children.map(c => c.fullName).join(', ') : 'None';
            
            return {
                id: parent.id,
                name: parent.fullName,
                children: childrenNames,
                phone: parent.phoneNumber || '',
                email: parent.user?.email || '',
                occupation: parent.occupation || 'N/A',
                address: parent.residentialAddress || 'N/A',
                status: parent.user?.isActive ? 'Active' : 'Inactive'
            };
        });
    }

    async createStudentWithParent(dto: CreateStudentWithParentDto, adminId?: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Get Admin's school name if adminId is provided
            let schoolName = 'NetzerTech School';
            if (adminId) {
                const admin = await queryRunner.manager.findOne(Admin, { 
                    where: { user: { id: adminId } },
                    relations: ['user']
                });
                if (admin && admin.address) {
                    // Extract school name: "NetzerTech High School (Size: 100-500)" -> "NetzerTech High School"
                    schoolName = admin.address.split(' (Size:')[0];
                }
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
                    password: 'defaultPassword123!', // Should be hashed in a real app
                    userType: UserRole.PARENT
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
                password: 'defaultPassword123!',
                userType: UserRole.SECONDARY_STUDENT
            });
            studentUser = await queryRunner.manager.save(User, studentUser);

            // 3. Find Class (Scoped by School)
            const studentClass = await queryRunner.manager.findOne(Class, { 
                where: { title: dto.class, school: schoolName } 
            });

            if (!studentClass) {
                throw new BadRequestException(`Class "${dto.class}" not found for this school. Please create the class first.`);
            }

            // Generate unique student ID (Scoped by School)
            let studentId: string;
            
            if (dto.studentId) {
                // Use provided ID if it's unique FOR THIS SCHOOL
                const existing = await queryRunner.manager.findOne(Student, { 
                    where: { studentId: dto.studentId, school: schoolName } 
                });
                if (existing) {
                    throw new Error(`Student ID ${dto.studentId} is already in use at your school.`);
                }
                studentId = dto.studentId;
            } else {
                // Auto-generate in format STU[YEAR][SEQ] e.g. STU2026001
                const currentYear = new Date().getFullYear();
                const prefix = `STU${currentYear}`;
                
                // Find the latest student ID for THIS SCHOOL with this prefix
                const latestStudent = await queryRunner.manager.createQueryBuilder(Student, 'student')
                    .where('student.studentId LIKE :prefix', { prefix: `${prefix}%` })
                    .andWhere('student.school = :schoolName', { schoolName })
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

                // Ensure it's unique by checking and incrementing if needed (safety net)
                let isUnique = false;
                while (!isUnique) {
                    studentId = `${prefix}${sequence.toString().padStart(3, '0')}`;
                    const existing = await queryRunner.manager.findOne(Student, { 
                        where: { studentId, school: schoolName } 
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
                school: schoolName, // SAVE WITH SCHOOL NAME
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
        const users = await this.userRepository.find({
            where: [
                { userType: UserRole.ADMIN, admin: schoolName ? { address: Like(`%${schoolName}%`) } : {} },
                { userType: UserRole.TEACHER, teacher: schoolName ? { school: schoolName } : {} }
            ],
            relations: ['admin', 'teacher']
        });

        return users.map(user => {
            let role = 'Admin';
            let department = 'Administration';

            if (user.userType === UserRole.TEACHER) {
                role = 'Teacher';
                department = user.teacher?.department || 'Academic';
            } else if (user.admin) {
                if (user.admin.isSuperAdmin) role = 'Super Admin';
                else if (user.admin.department) {
                    role = user.admin.department; // e.g., 'Principal', 'Bursar'
                    department = user.admin.department;
                }
            }

            const permissions = [
                { module: 'All Modules', canView: true, canEdit: user.userType === UserRole.ADMIN, canDelete: false }
            ];

            return {
                id: user.id,
                name: user.fullName,
                email: user.email,
                role: role,
                department: department,
                status: user.isActive ? 'Active' : 'Inactive',
                lastLogin: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString().split('T')[0] : 'Never',
                createdDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                permissions: permissions
            };
        });
    }

    async getDashboardStats(adminId?: string) {
        const schoolName = adminId ? await this.getAdminSchoolName(adminId) : null;

        const [studentCount, teacherCount, parentCount, classCount] = await Promise.all([
            this.studentRepository.count({ where: schoolName ? { school: schoolName } : {} }),
            this.teacherRepository.count({ where: schoolName ? { school: schoolName } : {} }),
            this.parentRepository.count({ 
                where: schoolName ? { children: { school: schoolName } } : {} 
            }),
            this.classRepository.count({ where: schoolName ? { school: schoolName } : {} }),
        ]);

        const recentUsers = await this.userRepository.find({
            where: schoolName ? [
                { student: { school: schoolName } },
                { teacher: { school: schoolName } }
            ] : {},
            order: { createdAt: 'DESC' },
            take: 5,
            relations: ['student', 'teacher']
        });

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
}
