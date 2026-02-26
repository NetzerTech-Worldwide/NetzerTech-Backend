import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    ManyToMany,
    OneToMany,
    JoinTable,
    JoinColumn,
} from 'typeorm';
import { Class } from './class.entity';
import { Student } from './student.entity';
import { LiveSessionMessage } from './live-session-message.entity';

export enum LiveSessionStatus {
    SCHEDULED = 'scheduled',
    LIVE = 'live',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

@Entity('live_sessions')
export class LiveSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column()
    startTime: Date;

    @Column()
    endTime: Date;

    @Column({ nullable: true })
    meetingUrl: string;

    @Column({
        type: 'enum',
        enum: LiveSessionStatus,
        default: LiveSessionStatus.SCHEDULED,
    })
    status: LiveSessionStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relations
    @ManyToOne(() => Class, (classEntity) => classEntity.liveSessions, { onDelete: 'CASCADE' })
    @JoinColumn()
    class: Class;

    @ManyToMany(() => Student)
    @JoinTable({
        name: 'live_session_participants',
        joinColumn: { name: 'sessionId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'studentId', referencedColumnName: 'id' },
    })
    participants: Student[];

    @OneToMany(() => LiveSessionMessage, (message) => message.session)
    messages: LiveSessionMessage[];
}
