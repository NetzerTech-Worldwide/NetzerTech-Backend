import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, Student, Parent, Teacher, Admin, AcademicProgress, Class, Assignment, StudentAssignment, ClassActivity, StudentClassActivity, Question, ClassActivityStatus, AssignmentStatus } from '../entities';
import { UserRole } from '../common/enums/user-role.enum';

export class DatabaseSeeder {
  constructor(private dataSource: DataSource) { }

  private async runMigrations() {
    console.log('Running schema migrations...');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // -- Parent table new columns --
      await queryRunner.query(`ALTER TABLE "parents" ADD COLUMN IF NOT EXISTS "relationship" varchar`);
      await queryRunner.query(`ALTER TABLE "parents" ADD COLUMN IF NOT EXISTS "email" varchar`);
      await queryRunner.query(`ALTER TABLE "parents" ADD COLUMN IF NOT EXISTS "occupation" varchar`);
      await queryRunner.query(`ALTER TABLE "parents" ADD COLUMN IF NOT EXISTS "workAddress" varchar`);

      // -- Student table new columns --
      await queryRunner.query(`ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "bloodGroup" varchar`);
      await queryRunner.query(`ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "genotype" varchar`);
      await queryRunner.query(`ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "medicalCondition" varchar`);
      await queryRunner.query(`ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "allergies" varchar`);
      await queryRunner.query(`ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "phoneNumber" varchar`);
      await queryRunner.query(`ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "residentialAddress" varchar`);
      await queryRunner.query(`ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "stateOfOrigin" varchar`);
      await queryRunner.query(`ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "lga" varchar`);
      await queryRunner.query(`ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "nationality" varchar`);
      await queryRunner.query(`ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "admissionDate" date`);

      // -- Attendance table new columns --
      await queryRunner.query(`ALTER TABLE "attendances" ADD COLUMN IF NOT EXISTS "timeIn" varchar`);
      await queryRunner.query(`ALTER TABLE "attendances" ADD COLUMN IF NOT EXISTS "timeOut" varchar`);

      // -- Leave requests table --
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "leave_requests" (
          "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          "leaveType" varchar NOT NULL DEFAULT 'other',
          "fromDate" date NOT NULL,
          "toDate" date NOT NULL,
          "reason" text NOT NULL,
          "status" varchar NOT NULL DEFAULT 'pending',
          "reviewerComments" text,
          "student_id" uuid REFERENCES "students"("id"),
          "reviewed_by_id" uuid REFERENCES "admins"("id"),
          "createdAt" timestamp DEFAULT now(),
          "updatedAt" timestamp DEFAULT now()
        )
      `);

      console.log('✓ Schema migrations completed');
    } catch (err) {
      console.error('Migration error:', err.message);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async seed() {

    console.log('Starting database seeding...');
    console.log('=====================================');

    // Run schema migrations first to ensure all new columns exist
    await this.runMigrations();

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
        mustChangePassword: false,  // false for test/dev account - no forced password change
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

      // -- 🚀 ADD REPORT CARD SEEDING HISTORY --
      const teacherRepository = this.dataSource.getRepository(Teacher);
      const classRepository = this.dataSource.getRepository(Class);
      const assignmentRepository = this.dataSource.getRepository(Assignment);
      const studentAssignmentRepository = this.dataSource.getRepository(StudentAssignment);
      const classActivityRepository = this.dataSource.getRepository(ClassActivity);
      const studentClassActivityRepository = this.dataSource.getRepository(StudentClassActivity);

      const teacher = await teacherRepository.findOne({ where: { employeeId: 'TCH001' } });

      if (teacher) {
        // 1. Create Mock Classes
        const mathClass = classRepository.create({
          title: 'SS3 Mathematics',
          subject: 'Mathematics',
          type: 'compulsory',
          gradeLevel: 'SS3',
          startTime: new Date(new Date().setHours(9, 0, 0, 0)),
          endTime: new Date(new Date().setHours(10, 0, 0, 0)),
          location: 'Room 5',
          isActive: true,
          teacher,
          students: [savedStudent]
        });

        const scienceClass = classRepository.create({
          title: 'SS3 Basic Science',
          subject: 'Science',
          type: 'compulsory',
          gradeLevel: 'SS3',
          startTime: new Date(new Date().setHours(11, 0, 0, 0)),
          endTime: new Date(new Date().setHours(12, 0, 0, 0)),
          location: 'Lab 2',
          isActive: true,
          teacher,
          students: [savedStudent]
        });

        const englishClass = classRepository.create({
          title: 'SS3 English',
          subject: 'English',
          type: 'compulsory',
          gradeLevel: 'SS3',
          startTime: new Date(new Date().setHours(13, 0, 0, 0)),
          endTime: new Date(new Date().setHours(14, 0, 0, 0)),
          location: 'Room 2',
          isActive: true,
          teacher,
          students: [savedStudent]
        });

        await classRepository.save([mathClass, scienceClass, englishClass]);

        // 2. Create Subject Mock Assignments
        const mathHW = assignmentRepository.create({
          title: 'Algebra Worksheet',
          subject: 'Mathematics',
          dueDate: new Date(),
          points: 10,
          teacher,
          class: mathClass,
          students: [savedStudent]
        });

        const engEssay = assignmentRepository.create({
          title: 'Narrative Essay',
          subject: 'English',
          dueDate: new Date(),
          points: 10,
          teacher,
          class: englishClass,
          students: [savedStudent]
        });

        await assignmentRepository.save([mathHW, engEssay]);

        // 3. Score Student Assignments (Out of 10)
        await studentAssignmentRepository.save([
          studentAssignmentRepository.create({
            grade: 8,
            status: AssignmentStatus.GRADED,
            student: savedStudent,
            assignment: mathHW,
          }),
          studentAssignmentRepository.create({
            grade: 7,
            status: AssignmentStatus.GRADED,
            student: savedStudent,
            assignment: engEssay,
          })
        ]);

        // 4. Create Mock Class Activities (Tests & Exams)
        const mathTest = classActivityRepository.create({
          title: 'Mid-Term Test',
          subject: 'Mathematics',
          dueDate: new Date(),
          totalPoints: 30,
          isCompleted: true,
          teacher,
          class: mathClass,
        });

        const mathExam = classActivityRepository.create({
          title: 'Final Examination',
          subject: 'Mathematics',
          dueDate: new Date(),
          totalPoints: 60,
          isCompleted: true,
          teacher,
          class: mathClass,
        });

        const engExam = classActivityRepository.create({
          title: 'Final Examination',
          subject: 'English',
          dueDate: new Date(),
          totalPoints: 60,
          isCompleted: true,
          teacher,
          class: englishClass,
        });

        const scienceTest = classActivityRepository.create({
          title: 'First CA Test',
          subject: 'Science',
          dueDate: new Date(),
          totalPoints: 40,
          isCompleted: true,
          teacher,
          class: scienceClass
        });

        await classActivityRepository.save([mathTest, mathExam, engExam, scienceTest]);

        // 5. Score the Student's Activities
        await studentClassActivityRepository.save([
          studentClassActivityRepository.create({
            score: 25, // Math Test Server returns this exactly mapping for 30
            status: ClassActivityStatus.GRADED,
            student: savedStudent,
            classActivity: mathTest,
          }),
          studentClassActivityRepository.create({
            score: 55, // Math Exam
            status: ClassActivityStatus.GRADED,
            student: savedStudent,
            classActivity: mathExam,
          }),
          studentClassActivityRepository.create({
            score: 42, // Eng Exam
            status: ClassActivityStatus.GRADED,
            student: savedStudent,
            classActivity: engExam,
          }),
          studentClassActivityRepository.create({
            score: 30, // Science Test
            status: ClassActivityStatus.GRADED,
            student: savedStudent,
            classActivity: scienceTest,
          })
        ]);

        console.log('✓ Injected dummy assignments, CBTs, and Class mappings for STU001 (Alice Student)');
      }
    } else {
      // Update password AND mustChangePassword for existing student
      const hashedPassword = await bcrypt.hash('student123', 10);
      if (existingStudent.user) {
        existingStudent.user.password = hashedPassword;
        existingStudent.user.isActive = true;
        existingStudent.user.mustChangePassword = false;  // Ensure test account is not blocked
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
        mustChangePassword: false,  // false for test/dev account
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
