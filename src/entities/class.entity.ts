import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { Teacher } from './teacher.entity';
import { Student } from './student.entity';
import { Attendance } from './attendance.entity';
import { StudentClassRegistration } from './student-class-registration.entity';
import { SubjectModule } from './subject-module.entity';
import { LiveSession } from './live-session.entity';
import { ClassActivity } from './class-activity.entity';
import { LearningMaterial } from './learning-material.entity';
import { Assignment } from './assignment.entity';

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  subject: string;

  @Column({ type: 'varchar', length: 20, default: 'compulsory' })
  type: string; // 'compulsory' or 'elective'

  @Column({ nullable: true })
  gradeLevel: string; // e.g., 'ss3', 'ss2', 'jss1', etc.

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Teacher, (teacher) => teacher.classes)
  @JoinColumn()
  teacher: Teacher;

  @ManyToMany(() => Student, (student) => student.classes)
  @JoinTable()
  students: Student[];

  @OneToMany(() => Attendance, (attendance) => attendance.class)
  attendances: Attendance[];

  @OneToMany(() => StudentClassRegistration, (registration) => registration.class)
  registrations: StudentClassRegistration[];

  @OneToMany(() => SubjectModule, (module) => module.class)
  modules: SubjectModule[];

  @OneToMany(() => LiveSession, (session) => session.class)
  liveSessions: LiveSession[];

  @OneToMany(() => ClassActivity, (classActivity) => classActivity.class)
  classActivities: ClassActivity[];

  @OneToMany(() => LearningMaterial, (material) => material.class)
  learningMaterials: LearningMaterial[];

  @OneToMany(() => Assignment, (assignment) => assignment.class)
  assignments: Assignment[];
}

