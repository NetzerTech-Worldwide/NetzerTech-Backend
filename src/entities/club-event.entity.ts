import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Club } from './club.entity';

@Entity('club_events')
export class ClubEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Club, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'club_id' })
    club: Club;

    @Column({ name: 'club_id' })
    clubId: string;

    @Column({ length: 255 })
    title: string;

    @Column('text', { nullable: true })
    description: string;

    @Column({ type: 'date' })
    date: string;

    @Column({ length: 100 })
    startTime: string;

    @Column({ length: 100 })
    endTime: string;

    @Column({ length: 255 })
    location: string;

    @CreateDateColumn()
    createdAt: Date;
}
