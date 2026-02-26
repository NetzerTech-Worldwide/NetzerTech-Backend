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
import { Class } from './class.entity';
import { LectureNote } from './lecture-note.entity';

export enum FileType {
  VIDEO = 'video',
  AUDIO = 'audio',
  PDF = 'pdf',
  IMAGE = 'image',
  DOC = 'doc',
}

@Entity('learning_materials')
export class LearningMaterial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  subject: string;

  @Column({
    type: 'enum',
    enum: FileType,
    default: FileType.PDF,
  })
  fileType: FileType;

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ nullable: true })
  duration: string; // e.g., '10:30' for video, '15 pages' for PDF

  @Column({ default: 0 })
  views: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Class, (cls) => cls.learningMaterials)
  @JoinColumn()
  class: Class;

  @OneToMany(() => LectureNote, (note) => note.learningMaterial)
  lectureNotes: LectureNote[];
}
