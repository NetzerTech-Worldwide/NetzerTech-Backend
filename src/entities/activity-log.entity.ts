import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Teacher } from './teacher.entity';

export enum ActivityType {
  CLASS_ACTIVITY_GRADED = 'class_activity_graded',
  CLASS_CONDUCTED = 'class_conducted',
  TEST_CREATED = 'test_created',
  CLASS_ACTIVITY_CREATED = 'class_activity_created',
  STUDENT_GRADED = 'student_graded',
  ATTENDANCE_MARKED = 'attendance_marked',
}

@Entity('activity_logs')
@Index(['teacher', 'createdAt'])
@Index(['activityType', 'createdAt'])
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  activityType: ActivityType;

  @Column()
  description: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Teacher, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  teacher: Teacher;
}

