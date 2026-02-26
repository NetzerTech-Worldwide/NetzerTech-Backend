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
    ClassActivityFilter
} from './dto';

@ApiTags('Examination')
@Controller('examination')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ExaminationController {
    constructor(private readonly academicService: AcademicService) { }

    @Get()
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get student examinations with filtering (Alias for class-activities)' })
    @ApiQuery({
        name: 'filter',
        enum: ClassActivityFilter,
        required: false,
        description: 'Filter examinations by their status (all, upcoming, or past)',
    })
    @ApiResponse({
        status: 200,
        description: 'Examinations retrieved successfully',
        type: [ClassActivityResponseDto],
    })
    async getExaminations(
        @Request() req: AuthenticatedRequest,
        @Query('filter') filter: ClassActivityFilter = ClassActivityFilter.ALL,
    ): Promise<ClassActivityResponseDto[]> {
        return this.academicService.getClassActivities(req.user.id, filter);
    }

    @Post(':id/start')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Start an examination' })
    @ApiResponse({
        status: 201,
        description: 'Examination started successfully',
        type: StartClassActivityResponseDto,
    })
    async startExamination(
        @Request() req: AuthenticatedRequest,
        @Param('id') examinationId: string,
    ): Promise<StartClassActivityResponseDto> {
        return this.academicService.startClassActivity(req.user.id, examinationId);
    }

    @Get(':id/questions')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get examination questions with pagination' })
    @ApiResponse({
        status: 200,
        description: 'Questions retrieved successfully',
        type: ClassActivityQuestionsResponseDto,
    })
    async getExaminationQuestions(
        @Request() req: AuthenticatedRequest,
        @Param('id') examinationId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<ClassActivityQuestionsResponseDto> {
        return this.academicService.getClassActivityQuestions(req.user.id, examinationId, Number(page), Number(limit));
    }

    @Get(':id')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Get examination details' })
    @ApiResponse({
        status: 200,
        description: 'Examination details retrieved successfully',
        type: ClassActivityDetailDto,
    })
    async getExaminationDetail(
        @Request() req: AuthenticatedRequest,
        @Param('id') examinationId: string,
    ): Promise<ClassActivityDetailDto> {
        return this.academicService.getClassActivityDetail(req.user.id, examinationId);
    }

    @Post(':id/submit')
    @HttpCode(HttpStatus.OK)
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Submit an examination attempt' })
    @ApiResponse({
        status: 200,
        description: 'Examination submitted and scored',
    })
    async submitExamination(
        @Request() req: AuthenticatedRequest,
        @Param('id') examinationId: string,
        @Body() submitDto: SubmitClassActivityDto,
    ): Promise<{ message: string; score: number }> {
        return this.academicService.submitClassActivity(req.user.id, examinationId, submitDto);
    }
}
