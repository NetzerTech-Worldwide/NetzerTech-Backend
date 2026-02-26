import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { Teacher } from './teacher.entity';
import { Student } from './student.entity';

@Entity('tests')
export class Test {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  subject: string;

  @Column()
  testDate: Date;

  @Column({ default: 100 })
  totalPoints: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Teacher, (teacher) => teacher.tests)
  @JoinColumn()
  teacher: Teacher;

  @ManyToMany(() => Student, (student) => student.tests)
  @JoinTable()
  students: Student[];
}

