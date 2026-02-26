import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ClassActivity } from './class-activity.entity';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
}

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  text: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.MULTIPLE_CHOICE,
  })
  type: QuestionType;

  @Column({ type: 'simple-array', nullable: true })
  options: string[]; // For MCQs

  @Column({ nullable: true })
  correctAnswer: string;

  @Column({ type: 'int', default: 1 })
  points: number;

  @Column({ type: 'int', default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ClassActivity, (classActivity) => classActivity.questions, { onDelete: 'CASCADE' })
  @JoinColumn()
  classActivity: ClassActivity;
}
