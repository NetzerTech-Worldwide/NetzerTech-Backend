import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RecordsService } from './records.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { ReportCardDto, TermDto, PerformanceAnalyticsDto } from './dto/records.dto';

@ApiTags('Records & Report Cards')
@Controller('records')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class RecordsController {
    constructor(private readonly recordsService: RecordsService) { }

    @Get('terms')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get available academic terms for the student' })
    @ApiResponse({
        status: 200,
        description: 'List of terms retrieved successfully',
        type: [TermDto],
    })
    async getAvailableTerms(@Request() req: AuthenticatedRequest): Promise<TermDto[]> {
        return this.recordsService.getAvailableTerms(req.user.id);
    }

    @Get('report-card')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get complete report card for a specific term' })
    @ApiQuery({ name: 'academicYear', required: true, example: '2024/2025' })
    @ApiQuery({ name: 'term', required: true, example: 'First' })
    @ApiResponse({
        status: 200,
        description: 'Report card generated successfully',
        type: ReportCardDto,
    })
    async getReportCard(
        @Request() req: AuthenticatedRequest,
        @Query('academicYear') academicYear: string,
        @Query('term') term: string,
    ): Promise<ReportCardDto> {
        return this.recordsService.getReportCard(req.user.id, academicYear, term);
    }

    @Get('performance')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get historical performance analytics for the line chart' })
    @ApiResponse({
        status: 200,
        description: 'Performance analytics retrieved successfully',
        type: [PerformanceAnalyticsDto],
    })
    async getPerformanceAnalytics(@Request() req: AuthenticatedRequest): Promise<PerformanceAnalyticsDto[]> {
        return this.recordsService.getPerformanceAnalytics(req.user.id);
    }
}
