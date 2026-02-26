import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Teacher } from './teacher.entity';
import { Student } from './student.entity';
import { Class } from './class.entity';
import { StudentAssignment } from './student-assignment.entity';

export enum AssignmentPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  subject: string;

  @Column({ nullable: true })
  type: string;

  @Column()
  dueDate: Date;

  @Column({ default: 100 })
  points: number;

  @Column({
    type: 'enum',
    enum: AssignmentPriority,
    default: AssignmentPriority.MEDIUM,
  })
  priority: AssignmentPriority;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Teacher)
  @JoinColumn()
  teacher: Teacher;

  @ManyToOne(() => Class, (cls) => cls.assignments)
  @JoinColumn()
  class: Class;

  @OneToMany(() => StudentAssignment, (sa: StudentAssignment) => sa.assignment)
  submissions: StudentAssignment[];

  @ManyToMany(() => Student)
  @JoinTable({ name: 'assignment_students' })
  students: Student[];
}
