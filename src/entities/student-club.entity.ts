import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Student } from './student.entity';
import { Club } from './club.entity';

export enum ClubRole {
    MEMBER = 'Member',
    LEAD = 'Club Lead',
}

@Entity('student_clubs')
export class StudentClub {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Student, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'student_id' })
    student: Student;

    @Column({ name: 'student_id' })
    studentId: string;

    @ManyToOne(() => Club, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'club_id' })
    club: Club;

    @Column({ name: 'club_id' })
    clubId: string;

    @Column({
        type: 'enum',
        enum: ClubRole,
        default: ClubRole.MEMBER,
    })
    role: ClubRole;

    @Column({ type: 'int', default: 0 })
    creditsEarned: number;

    @CreateDateColumn()
    joinedAt: Date;
}
