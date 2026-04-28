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

    async getClassesOverview(): Promise<AdminClassOverviewDto[]> {
        const classes = await this.classRepository.find({ relations: ['teacher', 'students', 'students.user'] });
        const results: AdminClassOverviewDto[] = [];

        for (const cls of classes) {
            const students = cls.students || [];
            
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

    async getStudents(): Promise<AdminStudentDto[]> {
        const students = await this.studentRepository.find({
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

    async getTeachers(): Promise<AdminTeacherDto[]> {
        const teachers = await this.teacherRepository.find({
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

    async getParents(): Promise<AdminParentDto[]> {
        const parents = await this.parentRepository.find({
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

    async createStudentWithParent(dto: CreateStudentWithParentDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Create Parent User (check if exists first by email, but here we assume new)
            // Ideally we'd generate a password or have an auth flow, but we mock it here.
            let parentUser = this.userRepository.create({
                email: dto.parentEmail,
                password: 'defaultPassword123!', // Should be hashed in a real app or sent via email
                userType: UserRole.PARENT,
                fullName: `${dto.parentFirstName} ${dto.parentLastName}`
            });
            parentUser = await queryRunner.manager.save(User, parentUser);

            const parent = this.parentRepository.create({
                fullName: parentUser.fullName,
                phoneNumber: dto.parentPhone,
                occupation: dto.parentOccupation,
                residentialAddress: dto.parentAddress,
                user: parentUser
            });
            await queryRunner.manager.save(Parent, parent);

            // 2. Create Student User
            const studentEmail = dto.studentEmail || `${dto.studentFirstName.toLowerCase()}.${dto.studentLastName.toLowerCase()}@student.netzertech.edu.ng`;
            let studentUser = this.userRepository.create({
                email: studentEmail,
                password: 'defaultPassword123!',
                userType: UserRole.SECONDARY_STUDENT,
                fullName: `${dto.studentFirstName} ${dto.studentLastName}`
            });
            studentUser = await queryRunner.manager.save(User, studentUser);

            // 3. Find Class
            const studentClass = await queryRunner.manager.findOne(Class, { where: { title: dto.class } });

            const studentId = `STU${Math.floor(10000 + Math.random() * 90000)}`;

            const student = this.studentRepository.create({
                studentId,
                fullName: studentUser.fullName,
                gender: dto.gender,
                dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
                parent: parent,
                user: studentUser,
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

    async getSystemUsers(): Promise<AdminSystemUserDto[]> {
        const users = await this.userRepository.find({
            where: [
                { userType: UserRole.ADMIN },
                { userType: UserRole.TEACHER }
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

    async getDashboardStats() {
        const [studentCount, teacherCount, parentCount, classCount] = await Promise.all([
            this.studentRepository.count(),
            this.teacherRepository.count(),
            this.parentRepository.count(),
            this.classRepository.count(),
        ]);

        const recentUsers = await this.userRepository.find({
            order: { createdAt: 'DESC' },
            take: 5
        });

        const recentActivities = recentUsers.map(user => ({
            action: `New ${user.userType.toLowerCase()} registered`,
            name: user.fullName,
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
