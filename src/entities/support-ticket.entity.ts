import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { User } from './user.entity';

export enum TicketStatus {
    IN_PROGRESS = 'In Progress',
    RESOLVED = 'Resolved',
}

export enum TicketCategory {
    ACADEMIC_ISSUES = 'Academic Issues',
    FEE_PAYMENT = 'Fee/Payment',
    TECHNICAL_ISSUES = 'Technical Issues',
    DOCUMENT_REQUESTS = 'Document Requests',
    OTHER = 'Other',
}

@Entity('support_tickets')
export class SupportTicket {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    ticketId: string;

    @Column({ type: 'enum', enum: TicketCategory, default: TicketCategory.OTHER })
    category: TicketCategory;

    @Column()
    subject: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.IN_PROGRESS })
    status: TicketStatus;

    @Column({ nullable: true })
    attachmentUrl: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @Column()
    userId: string;

    @Column({ nullable: true })
    resolvedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @BeforeInsert()
    generateTicketId() {
        const num = Math.floor(Math.random() * 9000) + 1000;
        this.ticketId = `TXT-${num}`;
    }
}
