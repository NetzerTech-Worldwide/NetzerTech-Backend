import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Student } from './student.entity';
import { Class } from './class.entity';

@Entity('student_class_registrations')
@Unique(['student', 'class', 'sessionYear', 'term'])
export class StudentClassRegistration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionYear: string;

  @Column()
  term: string;

  @Column()
  subject: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Student, (student) => student.registrations)
  @JoinColumn()
  student: Student;

  @ManyToOne(() => Class, (classEntity) => classEntity.registrations)
  @JoinColumn()
  class: Class;
}

