import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TimetableService } from './timetable.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { DailyTimetableDto, TimetableJoinDto } from './dto/timetable.dto';

@ApiTags('Timetable')
@Controller('timetable')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class TimetableController {
    constructor(private readonly timetableService: TimetableService) { }

    @Get()
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get the daily scheduled timetable for the student, or specify Start/End flags to return an array of days' })
    @ApiQuery({ name: 'date', required: false, description: 'Optional date string (YYYY-MM-DD)', example: '2024-05-23' })
    @ApiQuery({ name: 'startDate', required: false, description: 'Optional start date for a batch week query (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, description: 'Optional end date for a batch week query (YYYY-MM-DD)' })
    @ApiResponse({
        status: 200,
        description: 'Timetable(s) successfully retrieved. Returns an Array if startDate/endDate are passed, otherwise returns a single Object (DailyTimetableDto)',
    })
    async getTimetable(
        @Request() req: AuthenticatedRequest,
        @Query('date') dateString?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ): Promise<DailyTimetableDto | DailyTimetableDto[]> {
        if (startDate && endDate) {
            return this.timetableService.getRangeSchedule(req.user.id, startDate, endDate);
        }
        return this.timetableService.getDailySchedule(req.user.id, dateString);
    }

    @Post('join')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Log attendance for joining a timetable event' })
    @ApiResponse({ status: 201, description: 'Attendance logged successfully' })
    async joinEvent(
        @Request() req: AuthenticatedRequest,
        @Body() joinDto: TimetableJoinDto,
    ): Promise<{ message: string; success: boolean }> {
        return this.timetableService.joinEvent(req.user.id, joinDto);
    }
}
