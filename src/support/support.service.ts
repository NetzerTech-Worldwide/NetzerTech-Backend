import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket, TicketStatus } from '../entities/support-ticket.entity';
import { Faq } from '../entities/faq.entity';
import { CreateSupportTicketDto, HelpCategoryDto, CreateFaqDto } from './dto/support.dto';

@Injectable()
export class SupportService {
    constructor(
        @InjectRepository(SupportTicket)
        private ticketRepository: Repository<SupportTicket>,
        @InjectRepository(Faq)
        private faqRepository: Repository<Faq>,
    ) { }

    // --- Help Categories (static data matching the UI) ---
    getHelpCategories(): HelpCategoryDto[] {
        return [
            { name: 'Academic Issues', description: 'Get help with grades, assignments, course enrollment, and academic queries.' },
            { name: 'Fee/Payment Issues', description: 'Resolve payment concerns, request receipts, or inquire about fee structures.' },
            { name: 'Technical Issues', description: 'Report portal access problems, login issues, or technical difficulties.' },
            { name: 'Document Requests', description: 'Request transcripts, certificates, letters, or other official documents.' },
        ];
    }

    // --- FAQs ---
    async getFaqs(search?: string, category?: string): Promise<Faq[]> {
        const query = this.faqRepository
            .createQueryBuilder('faq')
            .where('faq.isActive = :isActive', { isActive: true });

        if (search) {
            query.andWhere(
                '(LOWER(faq.question) LIKE LOWER(:search) OR LOWER(faq.answer) LIKE LOWER(:search))',
                { search: `%${search}%` },
            );
        }

        if (category) {
            query.andWhere('faq.category = :category', { category });
        }

        return query.orderBy('faq.sortOrder', 'ASC').getMany().catch(() => []);
    }

    async createFaq(dto: CreateFaqDto): Promise<Faq> {
        const faq = this.faqRepository.create({
            question: dto.question,
            answer: dto.answer,
            category: dto.category || 'General',
            isActive: true,
            sortOrder: 0
        });
        return this.faqRepository.save(faq);
    }

    // --- Tickets ---
    async createTicket(userId: string, dto: CreateSupportTicketDto): Promise<SupportTicket> {
        const ticket = this.ticketRepository.create({
            userId,
            category: dto.category as any,
            subject: dto.subject,
            description: dto.description,
            attachmentUrl: dto.attachmentUrl || undefined,
        });

        return this.ticketRepository.save(ticket as any) as Promise<SupportTicket>;
    }

    async getTickets(userId: string, status?: string): Promise<SupportTicket[]> {
        const where: any = { userId };

        if (status === 'in-progress') {
            where.status = TicketStatus.IN_PROGRESS;
        } else if (status === 'resolved') {
            where.status = TicketStatus.RESOLVED;
        }

        return this.ticketRepository.find({
            where,
            order: { createdAt: 'DESC' },
        }).catch(() => []);
    }

    async getTicketById(userId: string, identifier: string): Promise<SupportTicket> {
        // Support lookup by either UUID (id) or ticket ID (TXT-XXXX)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

        let ticket: SupportTicket | null = null;

        if (isUuid) {
            ticket = await this.ticketRepository.findOne({
                where: { id: identifier, userId },
            });
        } else {
            ticket = await this.ticketRepository.findOne({
                where: { ticketId: identifier, userId },
            });
        }

        if (!ticket) {
            throw new NotFoundException('Support ticket not found');
        }

        return ticket;
    }

    async getTicketByIdForAdmin(identifier: string): Promise<SupportTicket> {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

        let ticket: SupportTicket | null = null;

        if (isUuid) {
            ticket = await this.ticketRepository.findOne({ where: { id: identifier } });
        } else {
            ticket = await this.ticketRepository.findOne({ where: { ticketId: identifier } });
        }

        if (!ticket) {
            throw new NotFoundException('Support ticket not found');
        }

        return ticket;
    }

    async addTicketNote(identifier: string, note: string, adminId: string): Promise<SupportTicket> {
        const ticket = await this.getTicketByIdForAdmin(identifier);
        
        // Append note with timestamp and admin info
        const timestamp = new Date().toISOString();
        const newNoteEntry = `[${timestamp}] Admin: ${note}`;
        
        ticket.notes = ticket.notes ? `${ticket.notes}\n${newNoteEntry}` : newNoteEntry;
        
        return this.ticketRepository.save(ticket);
    }

    async sendTicketEmail(identifier: string, recipientEmail: string, subject: string, messageBody: string, adminId: string) {
        const ticket = await this.getTicketByIdForAdmin(identifier);
        
        // Stub: Log the email action
        console.log(`[SupportService] Email sent for ticket ${ticket.ticketId} by admin ${adminId} to ${recipientEmail}`);
        console.log(`[SupportService] Subject: ${subject}`);
        
        return {
            message: 'Email sent successfully',
            ticketId: ticket.ticketId,
            recipient: recipientEmail
        };
    }
}
