import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Student } from './student.entity';
import { Bill } from './bill.entity';
import { Payment } from './payment.entity';

export enum StudentBillStatus {
  UNPAID = 'Unpaid',
  PARTIAL = 'Partial',
  PAID = 'Paid',
}

@Entity('student_bills')
export class StudentBill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column({
    type: 'enum',
    enum: StudentBillStatus,
    default: StudentBillStatus.UNPAID,
  })
  status: StudentBillStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Student, (student) => student.studentBills, { onDelete: 'CASCADE' })
  @JoinColumn()
  student: Student;

  @ManyToOne(() => Bill, (bill) => bill.studentBills, { onDelete: 'CASCADE' })
  @JoinColumn()
  bill: Bill;

  @OneToMany(() => Payment, (payment) => payment.studentBill, { cascade: true })
  payments: Payment[];
}
