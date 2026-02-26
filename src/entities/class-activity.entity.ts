import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { Teacher } from './teacher.entity';
import { Student } from './student.entity';
import { Class } from './class.entity';
import { Question } from './question.entity';
import { StudentClassActivity } from './student-class-activity.entity';

@Entity('class_activities')
export class ClassActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'int', nullable: true })
  timeLimit: number; // In minutes

  @Column()
  subject: string;

  @Column()
  dueDate: Date;

  @Column({ default: 100 })
  totalPoints: number;

  @Column({ default: false })
  isCompleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Teacher, (teacher) => teacher.classActivities)
  @JoinColumn()
  teacher: Teacher;

  @ManyToMany(() => Student, (student) => student.classActivities)
  @JoinTable()
  students: Student[];

  @ManyToOne(() => Class, (cls) => cls.classActivities)
  @JoinColumn()
  class: Class;

  @OneToMany(() => Question, (question) => question.classActivity)
  questions: Question[];

  @OneToMany(() => StudentClassActivity, (sca) => sca.classActivity)
  submissions: StudentClassActivity[];
}
