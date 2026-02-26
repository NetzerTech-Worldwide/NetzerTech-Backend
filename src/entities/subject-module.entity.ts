import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Class } from './class.entity';

@Entity('subject_modules')
export class SubjectModule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'int', default: 0 })
    order: number;

    @Column({ type: 'varchar', nullable: true })
    duration: string; // e.g., "2 weeks"

    @Column({ type: 'json', nullable: true })
    topics: string[];

    @Column({ type: 'simple-array', nullable: true })
    resources: string[]; // URLs or file paths

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relations
    @ManyToOne(() => Class, (classEntity) => classEntity.modules, { onDelete: 'CASCADE' })
    @JoinColumn()
    class: Class;
}
