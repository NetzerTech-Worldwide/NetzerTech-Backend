import { Controller, Get, Post, Body, UseGuards, Req, Request, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { AttendanceService } from './attendance.service';
import { CreateLeaveRequestDto, LeaveRequestStatsDto, LeaveRequestDetailDto, UpdateLeaveRequestDto, AdminClassAttendanceDto, AdminStudentAttendanceDto } from './dto/attendance.dto';

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

    @Get('leave-requests/stats')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get total, pending, approved, and rejected leave request counts' })
    @ApiResponse({ status: 200, type: LeaveRequestStatsDto })
    async getLeaveRequestStats(@Request() req) {
        return this.attendanceService.getLeaveRequestStats(req.user.id);
    }

    @Get('leave-requests')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get all leave requests for a student' })
    @ApiQuery({ name: 'status', required: false, description: 'Filter by status (All, pending, approved, rejected)' })
    @ApiResponse({ status: 200, type: [LeaveRequestDetailDto] })
    async getLeaveRequests(
        @Request() req,
        @Query('status') status?: string,
    ) {
        return this.attendanceService.getLeaveRequests(req.user.id, status);
    }

    @Get('leave-requests/:id')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get a single leave request detail' })
    @ApiResponse({ status: 200, type: LeaveRequestDetailDto })
    async getLeaveRequestById(
        @Request() req,
        @Param('id') id: string,
    ) {
        return this.attendanceService.getLeaveRequestById(req.user.id, id);
    }

    @Post('leave-requests')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Submit a new leave request' })
    async createLeaveRequest(@Request() req, @Body() body: CreateLeaveRequestDto) {
        return this.attendanceService.createLeaveRequest(req.user.id, body);
    }

    // --- Admin Endpoints ---

    @Get('admin/classes')
    @Roles(UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Get class-wise attendance overview for admins' })
    @ApiResponse({ status: 200, type: [AdminClassAttendanceDto] })
    async getAdminClasses() {
        return this.attendanceService.getAdminClasses();
    }

    @Get('admin/students')
    @Roles(UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Get student attendance records for admins' })
    @ApiQuery({ name: 'class', required: false, type: String })
    @ApiResponse({ status: 200, type: [AdminStudentAttendanceDto] })
    async getAdminStudents(@Query('class') className?: string) {
        return this.attendanceService.getAdminStudents(className);
    }

    @Get('admin/leave-requests')
    @Roles(UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Get all leave requests for admins' })
    @ApiQuery({ name: 'status', required: false, type: String })
    @ApiResponse({ status: 200, type: [LeaveRequestDetailDto] })
    async getAdminLeaveRequests(@Query('status') status?: string) {
        return this.attendanceService.getAdminAllLeaveRequests(status);
    }

    @Post('admin/leave-requests/:id/status')
    @Roles(UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Approve or reject a leave request' })
    async updateLeaveRequestStatus(
        @Param('id') id: string,
        @Body() dto: UpdateLeaveRequestDto,
        @Request() req
    ) {
        return this.attendanceService.updateLeaveRequestStatus(id, dto, req.user.id);
    }
}
