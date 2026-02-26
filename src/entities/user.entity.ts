import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserRole } from '../common/enums/user-role.enum';
import { Student } from './student.entity';
import { Parent } from './parent.entity';
import { Teacher } from './teacher.entity';
import { Admin } from './admin.entity';
import { PasswordResetToken } from './password-reset-token.entity';
import { ForumTopic } from './forum-topic.entity';
import { Reminder } from './reminder.entity';
import { Message } from './message.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  userType: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  mustChangePassword: boolean;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  passwordChangedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => Student, (student) => student.user, { cascade: true })
  student?: Student;

  @OneToOne(() => Parent, (parent) => parent.user, { cascade: true })
  parent?: Parent;

  @OneToOne(() => Teacher, (teacher) => teacher.user, { cascade: true })
  teacher?: Teacher;

  @OneToOne(() => Admin, (admin) => admin.user, { cascade: true })
  admin?: Admin;

  @OneToMany(() => PasswordResetToken, (token) => token.user)
  passwordResetTokens: PasswordResetToken[];

  @OneToMany(() => ForumTopic, (topic) => topic.author)
  forumTopics: ForumTopic[];

  @OneToMany(() => Reminder, (reminder) => reminder.user)
  reminders: Reminder[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.recipient)
  receivedMessages: Message[];
}
