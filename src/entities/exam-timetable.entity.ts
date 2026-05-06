import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('exam_timetables')
export class ExamTimetable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  examName: string;

  @Column()
  classLevel: string;

  @Column({ nullable: true })
  subject: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ nullable: true })
  venue: string;

  @Column({ nullable: true })
  school: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
