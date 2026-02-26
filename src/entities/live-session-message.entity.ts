import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { LiveSession } from './live-session.entity';

@Entity('live_session_messages')
export class LiveSessionMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  sender: User;

  @ManyToOne(() => LiveSession, (session) => session.messages, { onDelete: 'CASCADE' })
  @JoinColumn()
  session: LiveSession;
}
