import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BillItem } from './bill-item.entity';
import { StudentBill } from './student-bill.entity';

export enum BillStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  ARCHIVED = 'Archived',
}

@Entity('bills')
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  session: string;

  @Column()
  term: string;

  @Column({ nullable: true })
  targetClass: string;

  @Column()
  targetType: string; // 'student' | 'teacher'

  @Column({ default: false })
  isUniversal: boolean;

  @Column({
    type: 'enum',
    enum: BillStatus,
    default: BillStatus.DRAFT,
  })
  status: BillStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  bankCharges: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  vatPercent: number;

  @Column({ nullable: true })
  publishedDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => BillItem, (billItem) => billItem.bill, { cascade: true, eager: true })
  items: BillItem[];

  @OneToMany(() => StudentBill, (studentBill) => studentBill.bill, { cascade: true })
  studentBills: StudentBill[];
}
