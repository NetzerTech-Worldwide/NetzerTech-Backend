import { Controller, Get, Post, Body, Param, UseGuards, Req, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ClubService } from './club.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateClubDto, ClubStatsDto, ClubOverviewDto, ClubEventDto, ClubDetailDto } from './dto/club.dto';

@ApiTags('student-life-clubs')
@Controller('student-life/clubs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ClubController {
    constructor(private readonly clubService: ClubService) { }

    @Get('stats')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get summary statistics for student clubs' })
    @ApiResponse({ status: 200, type: ClubStatsDto })
    async getStats(@Request() req) {
        return this.clubService.getStats(req.user.id);
    }

    @Get()
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT, UserRole.ADMIN)
    @ApiOperation({ summary: 'Browse all approved active clubs' })
    @ApiResponse({ status: 200, type: [ClubOverviewDto] })
    async getAllClubs(@Request() req) {
        return this.clubService.getAllClubs(req.user.id);
    }

    @Get('my-clubs')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get all clubs the user has joined' })
    @ApiResponse({ status: 200, type: [ClubOverviewDto] })
    async getMyClubs(@Request() req) {
        return this.clubService.getMyClubs(req.user.id);
    }

    @Get('leadership')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get all clubs led by this student' })
    @ApiResponse({ status: 200, type: [ClubOverviewDto] })
    async getLeadershipClubs(@Request() req) {
        return this.clubService.getLeadershipClubs(req.user.id);
    }

    @Get('events')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get all upcoming club events' })
    @ApiResponse({ status: 200, type: [ClubEventDto] })
    async getUpcomingEvents(@Request() req) {
        return this.clubService.getUpcomingEvents(req.user.id);
    }

    @Get(':id')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get detailed club info including members and announcements' })
    @ApiResponse({ status: 200, type: ClubDetailDto })
    async getClubDetails(
        @Request() req,
        @Param('id') id: string
    ) {
        return this.clubService.getClubDetails(req.user.id, id);
    }

    @Post()
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Submit a new club proposal for admin approval' })
    async createClub(
        @Request() req,
        @Body() dto: CreateClubDto
    ) {
        return this.clubService.createClub(req.user.id, dto);
    }

    @Post(':id/join')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Join an existing approved club' })
    async joinClub(
        @Request() req,
        @Param('id') id: string
    ) {
        return this.clubService.joinClub(req.user.id, id);
    }

    @Post(':id/leave')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Leave an active club' })
    async leaveClub(
        @Request() req,
        @Param('id') id: string
    ) {
        return this.clubService.leaveClub(req.user.id, id);
    }

    @Post('events/:eventId/attend')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Confirm attendance mapping for a club event' })
    async confirmEventAttendance(
        @Request() req,
        @Param('eventId') eventId: string
    ) {
        return this.clubService.confirmEventAttendance(req.user.id, eventId);
    }
}
