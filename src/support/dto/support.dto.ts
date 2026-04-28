import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum TicketCategoryDto {
    ACADEMIC_ISSUES = 'Academic Issues',
    FEE_PAYMENT = 'Fee/Payment',
    TECHNICAL_ISSUES = 'Technical Issues',
    DOCUMENT_REQUESTS = 'Document Requests',
    OTHER = 'Other',
}

// --- Submit Ticket ---
export class CreateSupportTicketDto {
    @ApiProperty({ description: 'Issue category', enum: TicketCategoryDto, example: 'Academic Issues' })
    @IsEnum(TicketCategoryDto)
    category: TicketCategoryDto;

    @ApiProperty({ description: 'Brief summary of the issue', example: 'Request for Grade Review, Mathematics' })
    @IsString()
    @IsNotEmpty()
    subject: string;

    @ApiProperty({ description: 'Detailed description of the issue', example: 'I believe my final exam score was calculated incorrectly...' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiPropertyOptional({ description: 'URL of uploaded attachment (PNG, JPG, PDF up to 10MB)', example: 'https://storage.example.com/attachments/receipt.pdf' })
    @IsString()
    @IsOptional()
    attachmentUrl?: string;
}

// --- Ticket Response ---
export class SupportTicketResponseDto {
    @ApiProperty() id: string;
    @ApiProperty({ example: 'TXT-0147' }) ticketId: string;
    @ApiProperty({ example: 'Academic Issues' }) category: string;
    @ApiProperty({ example: 'Request for Grade Review, Mathematics' }) subject: string;
    @ApiProperty({ example: 'I believe my final exam score was calculated incorrectly...' }) description: string;
    @ApiProperty({ example: 'In Progress' }) status: string;
    @ApiPropertyOptional() attachmentUrl: string | null;
    @ApiProperty() createdAt: Date;
    @ApiPropertyOptional() resolvedAt: Date | null;
}

// --- FAQ Response ---
export class CreateFaqDto {
    @ApiProperty({ description: 'The question', example: 'How do I reset my password?' })
    @IsString()
    @IsNotEmpty()
    question: string;

    @ApiProperty({ description: 'The answer', example: 'To reset your password, click on your profile icon...' })
    @IsString()
    @IsNotEmpty()
    answer: string;

    @ApiPropertyOptional({ description: 'Category', example: 'Account' })
    @IsString()
    @IsOptional()
    category?: string;
}

export class FaqResponseDto {
    @ApiProperty() id: string;
    @ApiProperty({ example: 'How do I reset my password?' }) question: string;
    @ApiProperty({ example: 'To reset your password, click on your profile icon...' }) answer: string;
    @ApiPropertyOptional({ example: 'Account' }) category: string | null;
}

// --- Help Category ---
export class HelpCategoryDto {
    @ApiProperty({ example: 'Academic Issues' }) name: string;
    @ApiProperty({ example: 'Get help with grades, assignments, course enrollment, and academic queries.' }) description: string;
}
