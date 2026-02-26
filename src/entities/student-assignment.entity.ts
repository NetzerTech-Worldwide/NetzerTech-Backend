import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { Assignment } from './assignment.entity';

export enum AssignmentStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
}

@Entity('student_assignments')
export class StudentAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.PENDING,
  })
  status: AssignmentStatus;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ type: 'text', nullable: true })
  submissionText: string | null;

  @Column({ type: 'text', nullable: true })
  submissionUrl: string | null; // for attachments

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  grade: number;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Student)
  @JoinColumn()
  student: Student;

  @ManyToOne(() => Assignment, (assignment) => assignment.submissions)
  @JoinColumn()
  assignment: Assignment;
}
