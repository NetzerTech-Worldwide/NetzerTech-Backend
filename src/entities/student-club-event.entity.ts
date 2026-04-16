import {
    Entity,
    PrimaryColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Student } from './student.entity';
import { ClubEvent } from './club-event.entity';

@Entity('student_club_events')
export class StudentClubEvent {
    @PrimaryColumn({ name: 'student_id' })
    studentId: string;

    @PrimaryColumn({ name: 'event_id' })
    eventId: string;

    @ManyToOne(() => Student, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'student_id' })
    student: Student;

    @ManyToOne(() => ClubEvent, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'event_id' })
    event: ClubEvent;

    @CreateDateColumn()
    joinedAt: Date;
}
