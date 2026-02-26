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
import { ClassActivity } from './class-activity.entity';

export enum ClassActivityStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  LATE = 'late',
}

@Entity('student_class_activities')
export class StudentClassActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ClassActivityStatus,
    default: ClassActivityStatus.PENDING,
  })
  status: ClassActivityStatus;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ type: 'decimal', nullable: true })
  score: number;

  @Column({ type: 'json', nullable: true })
  answers: Record<string, string>; // questionId: answer

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Student, (student) => student.studentClassActivities)
  @JoinColumn()
  student: Student;

  @ManyToOne(() => ClassActivity, (classActivity) => classActivity.submissions)
  @JoinColumn()
  classActivity: ClassActivity;
}
