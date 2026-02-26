import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { LearningMaterial } from './learning-material.entity';
import { LectureNoteSection } from './lecture-note-section.entity';

@Entity('lecture_notes')
export class LectureNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  downloadUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => LearningMaterial, (material) => material.lectureNotes)
  @JoinColumn()
  learningMaterial: LearningMaterial;

  @OneToMany(() => LectureNoteSection, (section) => section.lectureNote)
  sections: LectureNoteSection[];
}
