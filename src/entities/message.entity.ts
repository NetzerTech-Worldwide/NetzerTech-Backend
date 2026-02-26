import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Student } from './student.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.sentMessages)
  @JoinColumn()
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMessages)
  @JoinColumn()
  recipient: User;

  @ManyToOne(() => Student, (student) => student.messages, { nullable: true })
  @JoinColumn()
  student: Student;
}

