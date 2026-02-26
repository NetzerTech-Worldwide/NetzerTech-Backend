import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LectureNote } from './lecture-note.entity';

@Entity('lecture_note_sections')
export class LectureNoteSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  topic: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => LectureNote, (note) => note.sections)
  @JoinColumn()
  lectureNote: LectureNote;
}
