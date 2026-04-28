import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import {
    CreateSupportTicketDto,
    SupportTicketResponseDto,
    FaqResponseDto,
    HelpCategoryDto,
    CreateFaqDto,
} from './dto/support.dto';

@ApiTags('Support')
@Controller('support')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SupportController {
    constructor(private readonly supportService: SupportService) { }

    // --- Help Categories ---
    @Get('categories')
    @ApiOperation({ summary: 'Get quick help categories' })
    @ApiResponse({ status: 200, description: 'List of help categories', type: [HelpCategoryDto] })
    getCategories(): HelpCategoryDto[] {
        return this.supportService.getHelpCategories();
    }

    // --- FAQs ---
    @Get('faqs')
    @ApiOperation({ summary: 'Get frequently asked questions' })
    @ApiQuery({ name: 'search', required: false, description: 'Search term for questions/answers' })
    @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
    @ApiResponse({ status: 200, description: 'List of FAQs', type: [FaqResponseDto] })
    async getFaqs(
        @Query('search') search?: string,
        @Query('category') category?: string,
    ) {
        return this.supportService.getFaqs(search, category);
    }

    @Post('faqs')
    @ApiOperation({ summary: 'Add a new FAQ (Admin only)' })
    @ApiResponse({ status: 201, description: 'FAQ created successfully', type: FaqResponseDto })
    async createFaq(@Body() dto: CreateFaqDto) {
        return this.supportService.createFaq(dto);
    }

    // --- Submit Ticket ---
    @Post('tickets')
    @ApiOperation({ summary: 'Submit a new support request' })
    @ApiResponse({ status: 201, description: 'Ticket created successfully', type: SupportTicketResponseDto })
    async createTicket(
        @Request() req: AuthenticatedRequest,
        @Body() dto: CreateSupportTicketDto,
    ) {
        return this.supportService.createTicket(req.user.id, dto);
    }

    // --- List Tickets ---
    @Get('tickets')
    @ApiOperation({ summary: 'View support ticket history' })
    @ApiQuery({ name: 'status', required: false, description: 'Filter by status: in-progress, resolved', enum: ['in-progress', 'resolved'] })
    @ApiResponse({ status: 200, description: 'List of support tickets', type: [SupportTicketResponseDto] })
    async getTickets(
        @Request() req: AuthenticatedRequest,
        @Query('status') status?: string,
    ) {
        return this.supportService.getTickets(req.user.id, status);
    }

    // --- Single Ticket ---
    @Get('tickets/:id')
    @ApiOperation({ summary: 'Get a single support ticket by ID' })
    @ApiResponse({ status: 200, description: 'Ticket details', type: SupportTicketResponseDto })
    @ApiResponse({ status: 404, description: 'Ticket not found' })
    async getTicket(
        @Request() req: AuthenticatedRequest,
        @Param('id') id: string,
    ) {
        return this.supportService.getTicketById(req.user.id, id);
    }
}
