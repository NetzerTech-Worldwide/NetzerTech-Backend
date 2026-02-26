import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from './student.entity';

@Entity('academic_progress')
export class AcademicProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  cgpa: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  gpa: number;

  @Column({ type: 'json', nullable: true })
  grades: Record<string, number>;

  @Column({ type: 'json', nullable: true })
  semesterResults: Record<string, any>;

  @Column({ default: 0 })
  totalCredits: number;

  @Column({ default: 0 })
  completedCredits: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => Student, (student) => student.academicProgress)
  @JoinColumn()
  student: Student;
}

