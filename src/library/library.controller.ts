import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LibraryService } from './library.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { SetReadingGoalDto, SetReminderDto, LibraryStatsDto, RateBookDto } from './dto/library.dto';

@ApiTags('Library')
@Controller('library')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
export class LibraryController {
    constructor(private readonly libraryService: LibraryService) {}

    @Get('stats')
    @ApiOperation({ summary: 'Get current library stats and reading goal progress' })
    @ApiResponse({ status: 200, type: LibraryStatsDto })
    async getStats(@Request() req: AuthenticatedRequest) {
        return this.libraryService.getStats(req.user.id);
    }

    @Get('catalog')
    @ApiOperation({ summary: 'Browse the book catalog' })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'category', required: false, enum: ['All', 'Science', 'Mathematics', 'Computer Studies', 'English', 'Biology'] })
    @ApiQuery({ name: 'status', required: false, enum: ['Available', 'Unavailable'] })
    async getCatalog(
        @Query('search') search?: string,
        @Query('category') category?: string,
        @Query('status') status?: string,
    ) {
        return this.libraryService.getCatalog(search, category, status);
    }

    // --- Loans ---
    @Get('borrowed')
    @ApiOperation({ summary: 'Get currently active borrowed books' })
    async getBorrowedBooks(@Request() req: AuthenticatedRequest) {
        return this.libraryService.getBorrowedBooks(req.user.id);
    }

    @Get('history')
    @ApiOperation({ summary: 'Get history of borrowed/returned books' })
    @ApiQuery({ name: 'status', required: false, enum: ['All', 'Active', 'Returned'], description: 'Filter by status' })
    async getBorrowHistory(
        @Request() req: AuthenticatedRequest,
        @Query('status') status?: string
    ) {
        return this.libraryService.getBorrowHistory(req.user.id, status);
    }

    @Post('borrow/:bookId')
    @ApiOperation({ summary: 'Borrow a specific book' })
    async borrowBook(@Request() req: AuthenticatedRequest, @Param('bookId') bookId: string) {
        return this.libraryService.borrowBook(req.user.id, bookId);
    }

    @Post('return/:loanId')
    @ApiOperation({ summary: 'Return a borrowed book' })
    async returnBook(@Request() req: AuthenticatedRequest, @Param('loanId') loanId: string) {
        return this.libraryService.returnBook(req.user.id, loanId);
    }

    @Post('renew/:loanId')
    @ApiOperation({ summary: 'Renew a borrowed book (extend due date)' })
    async renewBook(@Request() req: AuthenticatedRequest, @Param('loanId') loanId: string) {
        return this.libraryService.renewBook(req.user.id, loanId);
    }

    @Post('reminders/:loanId')
    @ApiOperation({ summary: 'Set a due date reminder for a borrowed book' })
    async setReminder(
        @Request() req: AuthenticatedRequest, 
        @Param('loanId') loanId: string,
        @Body() dto: SetReminderDto
    ) {
        return this.libraryService.setReminder(req.user.id, loanId, dto.daysBefore);
    }

    @Post('rate/:loanId')
    @ApiOperation({ summary: 'Rate a returned book (1-5)' })
    async rateBook(
        @Request() req: AuthenticatedRequest,
        @Param('loanId') loanId: string,
        @Body() dto: RateBookDto
    ) {
        return this.libraryService.rateLoan(req.user.id, loanId, dto.rating);
    }

    // --- Wishlist ---
    @Get('wishlist')
    @ApiOperation({ summary: 'Get wishlist books' })
    async getWishlist(@Request() req: AuthenticatedRequest) {
        return this.libraryService.getWishlist(req.user.id);
    }

    @Post('wishlist/:bookId')
    @ApiOperation({ summary: 'Toggle wishlist status for a book' })
    async toggleWishlist(@Request() req: AuthenticatedRequest, @Param('bookId') bookId: string) {
        return this.libraryService.toggleWishlist(req.user.id, bookId);
    }

    // --- Reservations ---
    @Get('reserved')
    @ApiOperation({ summary: 'Get reserved books' })
    async getReservations(@Request() req: AuthenticatedRequest) {
        return this.libraryService.getReservations(req.user.id);
    }

    @Post('reserve/:bookId')
    @ApiOperation({ summary: 'Reserve an unavailable book' })
    async reserveBook(@Request() req: AuthenticatedRequest, @Param('bookId') bookId: string) {
        return this.libraryService.reserveBook(req.user.id, bookId);
    }

    // --- Goals ---
    @Post('goals')
    @ApiOperation({ summary: 'Set yearly reading goal' })
    async setReadingGoal(
        @Request() req: AuthenticatedRequest, 
        @Body() dto: SetReadingGoalDto
    ) {
        return this.libraryService.setReadingGoal(req.user.id, dto);
    }
}
