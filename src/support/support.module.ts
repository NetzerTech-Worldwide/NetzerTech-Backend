import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { SupportTicket } from '../entities/support-ticket.entity';
import { Faq } from '../entities/faq.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([SupportTicket, Faq]),
    ],
    controllers: [SupportController],
    providers: [SupportService],
    exports: [SupportService],
})
export class SupportModule { }
