import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './student.entity';

@Entity('books')
export class Book {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    author: string;

    @Column({ nullable: true })
    isbn: string;

    @Column()
    category: string;

    @Column({ nullable: true })
    coverUrl: string;

    @Column({ type: 'int', default: 0 })
    pages: number;

    @Column({ type: 'decimal', precision: 3, scale: 1, default: 0 })
    rating: number;

    @Column({ type: 'int', default: 1 })
    totalCopies: number;

    @Column({ type: 'int', default: 1 })
    availableCopies: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 100 })
    lateFineRate: number; // Daily fine rate

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

export enum LoanStatus {
    ACTIVE = 'Active',
    RETURNED = 'Returned',
    OVERDUE = 'Overdue'
}

@Entity('book_loans')
export class BookLoan {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Book)
    @JoinColumn({ name: 'bookId' })
    book: Book;

    @Column()
    bookId: string;

    @ManyToOne(() => Student)
    @JoinColumn({ name: 'studentId' })
    student: Student;

    @Column()
    studentId: string;

    @Column({ type: 'timestamp' })
    borrowDate: Date;

    @Column({ type: 'timestamp' })
    dueDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    returnDate: Date;

    @Column({ type: 'enum', enum: LoanStatus, default: LoanStatus.ACTIVE })
    status: LoanStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    fineAmount: number;

    @Column({ nullable: true })
    reminderSentDaysBefore: number; // e.g. 1, 3, 7

    @CreateDateColumn()
    createdAt: Date;
}

@Entity('book_reservations')
export class BookReservation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Book)
    @JoinColumn({ name: 'bookId' })
    book: Book;

    @Column()
    bookId: string;

    @ManyToOne(() => Student)
    @JoinColumn({ name: 'studentId' })
    student: Student;

    @Column()
    studentId: string;

    @Column({ type: 'varchar', default: 'Pending' }) // Pending | Fulfilled | Cancelled
    status: string;

    @CreateDateColumn()
    createdAt: Date;
}

@Entity('book_wishlists')
export class BookWishlist {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Book)
    @JoinColumn({ name: 'bookId' })
    book: Book;

    @Column()
    bookId: string;

    @ManyToOne(() => Student)
    @JoinColumn({ name: 'studentId' })
    student: Student;

    @Column()
    studentId: string;

    @CreateDateColumn()
    createdAt: Date;
}

@Entity('reading_goals')
export class ReadingGoal {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Student)
    @JoinColumn({ name: 'studentId' })
    student: Student;

    @Column()
    studentId: string;

    @Column({ type: 'int' })
    year: number;

    @Column({ type: 'int', default: 20 })
    targetBooks: number;

    @Column({ type: 'int', default: 0 })
    booksRead: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
