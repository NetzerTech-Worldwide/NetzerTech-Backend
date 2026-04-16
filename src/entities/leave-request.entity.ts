import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { Admin } from './admin.entity';

export enum LeaveRequestStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export enum LeaveType {
    SICK_LEAVE = 'Sick Leave',
    PERSONAL_LEAVE = 'Personal Leave',
    FAMILY_EVENT = 'Family Event',
    EARLY_DISMISSAL = 'Early Dismissal',
    MEDICAL_APPOINTMENT = 'Medical Appointment',
    OTHER = 'Other',
}

@Entity('leave_requests')
export class LeaveRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: LeaveType,
        default: LeaveType.OTHER,
    })
    leaveType: LeaveType;

    @Column({ type: 'date' })
    fromDate: string | Date;

    @Column({ type: 'date' })
    toDate: string | Date;

    @Column('text')
    reason: string;

    @Column({ nullable: true })
    supportingDocumentUrl: string;

    @Column({
        type: 'enum',
        enum: LeaveRequestStatus,
        default: LeaveRequestStatus.PENDING,
    })
    status: LeaveRequestStatus;

    @ManyToOne(() => Student)
    @JoinColumn({ name: 'student_id' })
    student: Student;

    @ManyToOne(() => Admin, { nullable: true })
    @JoinColumn({ name: 'reviewed_by_id' })
    reviewedBy: Admin;

    @Column({ type: 'text', nullable: true })
    reviewerComments: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
