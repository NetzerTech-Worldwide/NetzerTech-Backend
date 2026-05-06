import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('timetable_periods')
export class TimetablePeriod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column({ default: 'Class' })
  periodType: string;

  @Column({ nullable: true })
  className: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ nullable: true })
  teacherId: string;

  @Column({ nullable: true })
  dayOfWeek: string;

  @Column({ nullable: true })
  school: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
