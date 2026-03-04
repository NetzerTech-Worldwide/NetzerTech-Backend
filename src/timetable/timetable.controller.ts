import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TimetableService } from './timetable.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { DailyTimetableDto } from './dto/timetable.dto';

@ApiTags('Timetable')
@Controller('timetable')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class TimetableController {
    constructor(private readonly timetableService: TimetableService) { }

    @Get()
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get the daily scheduled timetable for the student' })
    @ApiQuery({ name: 'date', required: false, description: 'Optional date string (YYYY-MM-DD)', example: '2024-05-23' })
    @ApiResponse({
        status: 200,
        description: 'Daily timetable successfully retrieved',
        type: DailyTimetableDto,
    })
    async getDailyTimetable(
        @Request() req: AuthenticatedRequest,
        @Query('date') dateString?: string,
    ): Promise<DailyTimetableDto> {
        return this.timetableService.getDailySchedule(req.user.id, dateString);
    }
}
