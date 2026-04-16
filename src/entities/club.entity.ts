import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Student } from './student.entity';

export enum ClubStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

@Entity('clubs')
export class Club {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    name: string;

    @Column('text')
    description: string;

    @Column({ length: 100 })
    meetingDay: string;

    @Column({ length: 100, nullable: true })
    meetingTime: string;

    @Column({ length: 255, nullable: true })
    advisorName: string;

    @Column({
        type: 'enum',
        enum: ClubStatus,
        default: ClubStatus.PENDING,
    })
    status: ClubStatus;

    @ManyToOne(() => Student)
    @JoinColumn({ name: 'created_by_id' })
    createdBy: Student;

    @Column({ name: 'created_by_id', nullable: true })
    createdById: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
