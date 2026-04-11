import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('faqs')
export class Faq {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    question: string;

    @Column({ type: 'text' })
    answer: string;

    @Column({ nullable: true })
    category: string;

    @Column({ default: 0 })
    sortOrder: number;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
