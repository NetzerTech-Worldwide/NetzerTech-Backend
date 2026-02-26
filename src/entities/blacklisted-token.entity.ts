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

@Entity('blacklisted_tokens')
@Index(['token'], { unique: true })
@Index(['expiresAt'])
export class BlacklistedToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  token: string;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}

