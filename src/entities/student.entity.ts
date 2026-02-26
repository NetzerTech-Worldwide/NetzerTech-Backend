import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Parent } from './parent.entity';
import { Class } from './class.entity';
import { ClassActivity } from './class-activity.entity';
import { Test } from './test.entity';
import { Event } from './event.entity';
import { Attendance } from './attendance.entity';
import { Fee } from './fee.entity';
import { Message } from './message.entity';
import { AcademicProgress } from './academic-progress.entity';
import { StudentClassRegistration } from './student-class-registration.entity';
import { StudentClassActivity } from './student-class-activity.entity';
import { Assignment } from './assignment.entity';
import { StudentAssignment } from './student-assignment.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  studentId: string;

  @Column({ unique: true, nullable: true })
  matricNumber: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  grade: string;

  @Column({ nullable: true })
  school: string;

  @Column({ nullable: true })
  gender: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.student)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Parent, (parent) => parent.children)
  @JoinColumn()
  parent: Parent;

  @ManyToMany(() => Class, (classEntity) => classEntity.students)
  classes: Class[];

  @ManyToMany(() => ClassActivity, (classActivity) => classActivity.students)
  classActivities: ClassActivity[];

  @ManyToMany(() => Test, (test) => test.students)
  tests: Test[];

  @ManyToMany(() => Event, (event) => event.students)
  events: Event[];

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendances: Attendance[];

  @OneToMany(() => Fee, (fee) => fee.student)
  fees: Fee[];

  @OneToMany(() => Message, (message) => message.student)
  messages: Message[];

  @OneToOne(() => AcademicProgress, (progress) => progress.student)
  academicProgress: AcademicProgress;

  @OneToMany(() => StudentClassRegistration, (registration) => registration.student)
  registrations: StudentClassRegistration[];

  @OneToMany(() => StudentClassActivity, (sca) => sca.student)
  studentClassActivities: StudentClassActivity[];

  @ManyToMany(() => Assignment, (assignment) => assignment.students)
  assignments: Assignment[];

  @OneToMany(() => StudentAssignment, (sa) => sa.student)
  studentAssignments: StudentAssignment[];
}
