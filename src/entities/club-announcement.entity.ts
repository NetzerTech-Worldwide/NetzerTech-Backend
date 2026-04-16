import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Club } from './club.entity';

@Entity('club_announcements')
export class ClubAnnouncement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Club, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'club_id' })
    club: Club;

    @Column({ name: 'club_id' })
    clubId: string;

    @Column({ length: 255 })
    title: string;

    @Column('text')
    content: string;

    @Column({ length: 255 })
    postedBy: string;

    @CreateDateColumn()
    createdAt: Date;
}
