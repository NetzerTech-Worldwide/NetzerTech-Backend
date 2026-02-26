import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Class } from './class.entity';
import { ClassActivity } from './class-activity.entity';
import { Test } from './test.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  employeeId: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  address: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.teacher)
  @JoinColumn()
  user: User;

  @OneToMany(() => Class, (classEntity) => classEntity.teacher)
  classes: Class[];

  @OneToMany(() => ClassActivity, (classActivity) => classActivity.teacher)
  classActivities: ClassActivity[];

  @OneToMany(() => Test, (test) => test.teacher)
  tests: Test[];
}
