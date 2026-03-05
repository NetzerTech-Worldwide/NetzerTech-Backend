import { Controller, Get, Post, Body, UseGuards, Req, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { AttendanceService } from './attendance.service';
import { CreateLeaveRequestDto } from './dto/attendance.dto';

@ApiTags('attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Get('overview')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get overview metrics for attendance' })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    async getOverview(
        @Request() req,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.attendanceService.getOverview(req.user.id, startDate, endDate);
    }

    @Get('calendar')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get daily attendance status for calendar dots' })
    @ApiQuery({ name: 'month', required: true, type: Number })
    @ApiQuery({ name: 'year', required: true, type: Number })
    async getCalendar(@Request() req, @Query('month') month: number, @Query('year') year: number) {
        return this.attendanceService.getCalendar(req.user.id, month, year);
    }

    @Get('subjects')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get attendance percentage charts grouped by subject' })
    async getSubjects(@Request() req) {
        return this.attendanceService.getSubjectProgress(req.user.id);
    }

    @Get('history')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get detailed paginated history for attendance' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'status', required: false, type: String, example: 'absent' })
    @ApiQuery({ name: 'subject', required: false, type: String })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    async getHistory(
        @Request() req,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('status') status?: string,
        @Query('subject') subject?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.attendanceService.getHistory(req.user.id, {
            page: page || 1,
            limit: limit || 10,
            status, subject, startDate, endDate
        });
    }

    @Get('leave-requests')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get all active leave requests for a student' })
    async getLeaveRequests(@Request() req) {
        return this.attendanceService.getLeaveRequests(req.user.id);
    }

    @Post('leave-requests')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Submit a new leave request' })
    async createLeaveRequest(@Request() req, @Body() body: CreateLeaveRequestDto) {
        return this.attendanceService.createLeaveRequest(req.user.id, body);
    }
}
