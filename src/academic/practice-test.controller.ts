import { Controller, Get, Post, UseGuards, Request, Body, HttpCode, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AcademicService } from './academic.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import {
    StartClassActivityResponseDto,
    ClassActivityQuestionsResponseDto,
    ClassActivityDetailDto,
    SubmitClassActivityDto,
    ClassActivityResponseDto,
    ClassActivityFilter,
    SaveClassActivityProgressDto,
    ClassActivityResultAnalysisDto,
    ClassActivityReviewResponseDto
} from './dto';

@ApiTags('Practice Tests')
@Controller('practice-tests')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PracticeTestController {
    constructor(private readonly academicService: AcademicService) { }

    @Get()
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get student practice tests' })
    @ApiQuery({
        name: 'filter',
        enum: ClassActivityFilter,
        required: false,
        description: 'Filter practice tests by their status (all, upcoming, or past)',
    })
    @ApiResponse({
        status: 200,
        description: 'Practice tests retrieved successfully',
        type: [ClassActivityResponseDto],
    })
    async getPracticeTests(
        @Request() req: AuthenticatedRequest,
        @Query('filter') filter: ClassActivityFilter = ClassActivityFilter.ALL,
    ): Promise<ClassActivityResponseDto[]> {
        // Fetch class activities and filter for isPractice 
        const activities = await this.academicService.getClassActivities(req.user.id, filter);
        return activities.filter((activity: any) => activity.isPractice === true);
    }

    @Post(':id/start')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Start a practice test' })
    @ApiResponse({
        status: 201,
        description: 'Practice test started successfully',
        type: StartClassActivityResponseDto,
    })
    async startPracticeTest(
        @Request() req: AuthenticatedRequest,
        @Param('id') examinationId: string,
    ): Promise<StartClassActivityResponseDto> {
        return this.academicService.startClassActivity(req.user.id, examinationId);
    }

    @Get(':id/questions')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get practice test questions with pagination' })
    @ApiResponse({
        status: 200,
        description: 'Questions retrieved successfully',
        type: ClassActivityQuestionsResponseDto,
    })
    async getPracticeTestQuestions(
        @Request() req: AuthenticatedRequest,
        @Param('id') examinationId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<ClassActivityQuestionsResponseDto> {
        return this.academicService.getClassActivityQuestions(req.user.id, examinationId, Number(page), Number(limit));
    }

    @Get(':id')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get practice test details' })
    @ApiResponse({
        status: 200,
        description: 'Practice test details retrieved successfully',
        type: ClassActivityDetailDto,
    })
    async getPracticeTestDetail(
        @Request() req: AuthenticatedRequest,
        @Param('id') examinationId: string,
    ): Promise<ClassActivityDetailDto> {
        return this.academicService.getClassActivityDetail(req.user.id, examinationId);
    }

    @Post(':id/submit')
    @HttpCode(HttpStatus.OK)
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Submit a practice test attempt' })
    @ApiResponse({
        status: 200,
        description: 'Practice test submitted and scored',
    })
    async submitPracticeTest(
        @Request() req: AuthenticatedRequest,
        @Param('id') examinationId: string,
        @Body() submitDto: SubmitClassActivityDto,
    ): Promise<{ message: string; score: number }> {
        return this.academicService.submitClassActivity(req.user.id, examinationId, submitDto);
    }

    @Post(':id/save-progress')
    @HttpCode(HttpStatus.OK)
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Auto-save student progress for an active practice test' })
    @ApiResponse({
        status: 200,
        description: 'Practice test progress saved successfully',
    })
    async savePracticeTestProgress(
        @Request() req: AuthenticatedRequest,
        @Param('id') examinationId: string,
        @Body() progressDto: SaveClassActivityProgressDto,
    ): Promise<{ success: boolean }> {
        return this.academicService.saveClassActivityProgress(req.user.id, examinationId, progressDto);
    }

    @Get(':id/result')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get detailed practice test result analytics' })
    @ApiResponse({
        status: 200,
        description: 'Detailed analytics retrieved successfully',
        type: ClassActivityResultAnalysisDto,
    })
    async getPracticeTestResult(
        @Request() req: AuthenticatedRequest,
        @Param('id') examinationId: string,
    ): Promise<ClassActivityResultAnalysisDto> {
        return this.academicService.getClassActivityResult(req.user.id, examinationId);
    }

    @Get(':examinationId/review')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get a full review of submitted answers vs correct answers' })
    @ApiResponse({
        status: 200,
        description: 'Returns the question-by-question breakdown of the test.',
        type: ClassActivityReviewResponseDto,
    })
    async getPracticeTestReview(
        @Request() req: AuthenticatedRequest,
        @Param('examinationId') examinationId: string,
    ): Promise<ClassActivityReviewResponseDto> {
        return this.academicService.getClassActivityReview(req.user.id, examinationId);
    }
}
