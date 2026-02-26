import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, Student, Parent, Teacher, Admin, AcademicProgress } from '../entities';
import { UserRole } from '../common/enums/user-role.enum';

export class DatabaseSeeder {
  constructor(private dataSource: DataSource) {}

  async seed() {
    console.log('Starting database seeding...');
    console.log('=====================================');

    // Create admin user
    await this.createAdmin();
    
    // Create teacher user
    await this.createTeacher();
    
    // Create parent
    const parent = await this.createParent();
    
    if (!parent) {
      throw new Error('Failed to create or find parent user');
    }
    
    // Create secondary student
    await this.createSecondaryStudent(parent);
    
    // Create university student
    await this.createUniversityStudent();

    console.log('=====================================');
    console.log('Database seeding completed!');
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('\nADMIN:');
    console.log('  Email: admin@netzertech.com');
    console.log('  Password: admin123');
    console.log('\nTEACHER:');
    console.log('  Staff ID: TCH001');
    console.log('  Password: teacher123');
    console.log('\nPARENT:');
    console.log('  Email: parent@example.com');
    console.log('  Password: parent123');
    console.log('  Student ID (for login): STU001');
    console.log('\nSECONDARY STUDENT:');
    console.log('  Student ID: STU001');
    console.log('  Full Name: Alice Student');
    console.log('  Password: student123');
    console.log('\nUNIVERSITY STUDENT:');
    console.log('  Matric Number: MAT001');
    console.log('  Full Name: Bob University');
    console.log('  Password: university123');
    console.log('\n=====================================\n');
  }

  private async createAdmin() {
    const userRepository = this.dataSource.getRepository(User);
    const adminRepository = this.dataSource.getRepository(Admin);

    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@netzertech.com' },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const user = userRepository.create({
        email: 'admin@netzertech.com',
        password: hashedPassword,
        userType: UserRole.ADMIN,
        isActive: true,
        mustChangePassword: true,
      });

      const savedUser = await userRepository.save(user);

      const admin = adminRepository.create({
        fullName: 'System Administrator',
        employeeId: 'ADM001',
        department: 'IT',
        phoneNumber: '+1234567890',
        address: '123 Admin Street',
        isSuperAdmin: true,
        user: savedUser,
      });

      await adminRepository.save(admin);
      console.log('✓ Admin user created: admin@netzertech.com');
    } else {
      // Update password for existing admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      existingAdmin.password = hashedPassword;
      existingAdmin.isActive = true;
      await userRepository.save(existingAdmin);
      console.log('✓ Admin user password updated: admin@netzertech.com');
    }
  }

  private async createTeacher() {
    const userRepository = this.dataSource.getRepository(User);
    const teacherRepository = this.dataSource.getRepository(Teacher);

    const existingTeacher = await userRepository.findOne({
      where: { email: 'teacher@netzertech.com' },
    });

    if (!existingTeacher) {
      const hashedPassword = await bcrypt.hash('teacher123', 10);
      
      const user = userRepository.create({
        email: 'teacher@netzertech.com',
        password: hashedPassword,
        userType: UserRole.TEACHER,
        isActive: true,
        mustChangePassword: true,
      });

      const savedUser = await userRepository.save(user);

      const teacher = teacherRepository.create({
        fullName: 'John Teacher',
        employeeId: 'TCH001',
        department: 'Mathematics',
        phoneNumber: '+1234567891',
        address: '456 Teacher Avenue',
        user: savedUser,
      });

      await teacherRepository.save(teacher);
      console.log('✓ Teacher user created: teacher@netzertech.com');
    } else {
      // Update password for existing teacher
      const hashedPassword = await bcrypt.hash('teacher123', 10);
      existingTeacher.password = hashedPassword;
      existingTeacher.isActive = true;
      await userRepository.save(existingTeacher);
      console.log('✓ Teacher user password updated: teacher@netzertech.com');
    }
  }

  private async createParent() {
    const userRepository = this.dataSource.getRepository(User);
    const parentRepository = this.dataSource.getRepository(Parent);

    const existingParent = await userRepository.findOne({
      where: { email: 'parent@example.com' },
    });

    if (!existingParent) {
      const hashedPassword = await bcrypt.hash('parent123', 10);
      
      const user = userRepository.create({
        email: 'parent@example.com',
        password: hashedPassword,
        userType: UserRole.PARENT,
        isActive: true,
        mustChangePassword: true,
      });

      const savedUser = await userRepository.save(user);

      const parent = parentRepository.create({
        fullName: 'Jane Parent',
        phoneNumber: '+1234567892',
        address: '789 Parent Lane',
        user: savedUser,
      });

      const savedParent = await parentRepository.save(parent);
      console.log('✓ Parent user created: parent@example.com');
      return savedParent;
    }
    
    // Update password for existing parent
    const hashedPassword = await bcrypt.hash('parent123', 10);
    existingParent.password = hashedPassword;
    existingParent.isActive = true;
    await userRepository.save(existingParent);
    console.log('✓ Parent user password updated: parent@example.com');
    
    return await parentRepository.findOne({
      where: { user: { email: 'parent@example.com' } },
      relations: ['user'],
    });
  }

  private async createSecondaryStudent(parent: Parent) {
    const userRepository = this.dataSource.getRepository(User);
    const studentRepository = this.dataSource.getRepository(Student);
    const academicProgressRepository = this.dataSource.getRepository(AcademicProgress);

    const existingStudent = await studentRepository.findOne({
      where: { studentId: 'STU001' },
      relations: ['user'],
    });

    if (!existingStudent) {
      const hashedPassword = await bcrypt.hash('student123', 10);
      
      const studentUser = userRepository.create({
        email: 'student@example.com',
        password: hashedPassword,
        userType: UserRole.SECONDARY_STUDENT,
        isActive: true,
        mustChangePassword: true,
      });

      const savedStudentUser = await userRepository.save(studentUser);

      const student = studentRepository.create({
        studentId: 'STU001',
        fullName: 'Alice Student',
        dateOfBirth: new Date('2010-05-15'),
        grade: '10th Grade',
        school: 'NetzerTech High School',
        gender: 'Female',
        user: savedStudentUser,
        parent: parent,
      });

      const savedStudent = await studentRepository.save(student);

      // Create academic progress for secondary student
      const academicProgress = academicProgressRepository.create({
        gpa: 3.75,
        grades: {
          'Mathematics': 85,
          'English': 90,
          'Science': 88,
          'History': 82,
        },
        totalCredits: 20,
        completedCredits: 20,
        student: savedStudent,
      });

      await academicProgressRepository.save(academicProgress);
      console.log('✓ Secondary Student created: STU001 (Alice Student)');
    } else {
      // Update password for existing student
      const hashedPassword = await bcrypt.hash('student123', 10);
      if (existingStudent.user) {
        existingStudent.user.password = hashedPassword;
        existingStudent.user.isActive = true;
        await userRepository.save(existingStudent.user);
        console.log('✓ Secondary Student password updated: STU001 (Alice Student)');
      } else {
        console.log('✓ Secondary Student already exists: STU001 (no user found)');
      }
    }
  }

  private async createUniversityStudent() {
    const userRepository = this.dataSource.getRepository(User);
    const studentRepository = this.dataSource.getRepository(Student);
    const academicProgressRepository = this.dataSource.getRepository(AcademicProgress);

    // First try to find by matricNumber
    let existingStudent = await studentRepository.findOne({
      where: { matricNumber: 'MAT001' },
      relations: ['user'],
    });

    // If not found by matricNumber, try by email
    if (!existingStudent) {
      const existingUser = await userRepository.findOne({
        where: { email: 'university@example.com' },
      });
      if (existingUser) {
        existingStudent = await studentRepository.findOne({
          where: { user: { id: existingUser.id } },
          relations: ['user'],
        });
      }
    }

    if (!existingStudent) {
      const hashedPassword = await bcrypt.hash('university123', 10);
      
      const studentUser = userRepository.create({
        email: 'university@example.com',
        password: hashedPassword,
        userType: UserRole.UNIVERSITY_STUDENT,
        isActive: true,
        mustChangePassword: true,
      });

      const savedStudentUser = await userRepository.save(studentUser);

      const student = studentRepository.create({
        matricNumber: 'MAT001',
        fullName: 'Bob University',
        dateOfBirth: new Date('2000-03-20'),
        grade: 'Sophomore',
        school: 'NetzerTech University',
        gender: 'Male',
        user: savedStudentUser,
      });

      const savedStudent = await studentRepository.save(student);

      // Create academic progress for university student with CGPA
      const academicProgress = academicProgressRepository.create({
        cgpa: 3.85,
        gpa: 3.90,
        grades: {
          'Computer Science 101': 92,
          'Mathematics 201': 88,
          'Physics 101': 90,
          'Chemistry 101': 85,
        },
        semesterResults: {
          'Fall 2024': {
            gpa: 3.90,
            credits: 15,
          },
          'Spring 2024': {
            gpa: 3.80,
            credits: 15,
          },
        },
        totalCredits: 60,
        completedCredits: 30,
        student: savedStudent,
      });

      await academicProgressRepository.save(academicProgress);
      console.log('✓ University Student created: MAT001 (Bob University)');
    } else {
      // Update password for existing university student
      const hashedPassword = await bcrypt.hash('university123', 10);
      if (existingStudent.user) {
        existingStudent.user.password = hashedPassword;
        existingStudent.user.isActive = true;
        await userRepository.save(existingStudent.user);
        // Ensure matric number exists for university student
        if (!existingStudent.matricNumber) {
          existingStudent.matricNumber = 'MAT001';
          await studentRepository.save(existingStudent);
        }
        console.log('✓ University Student password updated: MAT001 (Bob University)');
      } else {
        console.log('✓ University Student already exists: UNI001 (no user found)');
      }
    }
  }
}
