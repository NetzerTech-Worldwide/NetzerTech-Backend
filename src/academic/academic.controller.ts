import { Controller, Get, Post, UseGuards, Request, Body, HttpCode, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AcademicService } from './academic.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { AvailableSubjectsDto } from './dto/subject.dto';
import { StudentCoursesDto } from './dto/student-course.dto';
import { RegisterSubjectDto, RegisterSubjectResponseDto } from './dto/register-subject.dto';
import { StudentSubjectsProgressDto } from './dto/student-subject-progress.dto';
import { AllSubjectsRoadmapDto, SubjectRoadmapDetailDto } from './dto/roadmap.dto';
import { CreateSubjectModuleDto, SubjectModuleResponseDto } from './dto/subject-module.dto';
import { LiveSessionDto, LiveSessionDetailDto, ScheduleReminderDto } from './dto/live-session.dto';
import { LiveSessionMessageDto, SendLiveSessionMessageDto } from './dto/live-session-message.dto';
import { StartClassActivityResponseDto, ClassActivityQuestionsResponseDto, ClassActivityDetailDto, SubmitClassActivityDto, ClassActivityResponseDto, ClassActivityFilter, LearningMaterialDto, LearningMaterialDetailDto, AssignmentResponseDto, AssignmentFilter, AssignmentDetailDto, StartAssignmentResponseDto, SubmitAssignmentDto, SubmissionViewDto } from './dto';

@ApiTags('Academic')
@Controller('academic')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AcademicController {
  constructor(private readonly academicService: AcademicService) { }

  @Get('subjects')
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all available subjects with registration status',
    description: 'For students: returns all subjects with isRegistered status. For teachers/admins: returns all subjects without registration status.'
  })
  @ApiResponse({
    status: 200,
    description: 'Available subjects retrieved successfully',
    type: AvailableSubjectsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Invalid role' })
  async getAvailableSubjects(@Request() req: AuthenticatedRequest): Promise<AvailableSubjectsDto> {
    const userId = [UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT].includes(req.user.userType)
      ? req.user.id
      : undefined;
    return this.academicService.getAvailableSubjects(userId);
  }

  @Get('courses')
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({
    summary: 'Get student enrolled subjects with type and teacher information',
    description: 'Returns list of enrolled subjects with their type (compulsory/elective), teacher name, total enrolled subjects count, and average progress'
  })
  @ApiResponse({
    status: 200,
    description: 'Student subjects retrieved successfully',
    type: StudentCoursesDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Invalid role' })
  @ApiResponse({ status: 404, description: 'Student profile not found' })
  async getStudentCourses(@Request() req: AuthenticatedRequest): Promise<StudentCoursesDto> {
    return this.academicService.getStudentCourses(req.user.id);
  }

  @Get('subjects-progress')
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'Get student registered subjects with their progress' })
  @ApiResponse({
    status: 200,
    description: 'Student subjects and progress retrieved successfully',
    type: StudentSubjectsProgressDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Invalid role' })
  @ApiResponse({ status: 404, description: 'Student profile not found' })
  async getStudentSubjectsProgress(@Request() req: AuthenticatedRequest): Promise<StudentSubjectsProgressDto> {
    return this.academicService.getStudentSubjectsProgress(req.user.id);
  }

  @Post('register-subject')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({
    summary: 'Register student for subjects',
    description: 'Register for multiple subjects in a specific class/grade level (e.g., ss3) for a session and term. The student will be automatically enrolled in the classes for each subject.'
  })
  @ApiResponse({
    status: 201,
    description: 'Subject registration completed',
    type: RegisterSubjectResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data or no successful registrations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Invalid role' })
  @ApiResponse({ status: 404, description: 'Student profile not found' })
  async registerSubject(
    @Request() req: AuthenticatedRequest,
    @Body() registerDto: RegisterSubjectDto,
  ): Promise<RegisterSubjectResponseDto> {
    return this.academicService.registerSubject(req.user.id, registerDto);
  }

  @Get('roadmap')
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'Get all subject learning roadmaps' })
  @ApiResponse({
    status: 200,
    description: 'Subject roadmaps retrieved successfully',
    type: AllSubjectsRoadmapDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Invalid role' })
  @ApiResponse({ status: 404, description: 'Student profile not found' })
  async getStudentRoadmap(@Request() req: AuthenticatedRequest): Promise<AllSubjectsRoadmapDto> {
    return this.academicService.getStudentRoadmap(req.user.id);
  }

  @Get('roadmap/:subjectName')
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'Get detailed roadmap for a specific subject' })
  @ApiResponse({
    status: 200,
    description: 'Subject roadmap detail retrieved successfully',
    type: SubjectRoadmapDetailDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Invalid role' })
  @ApiResponse({ status: 404, description: 'Student profile not found' })
  async getSubjectRoadmapDetail(
    @Request() req: AuthenticatedRequest,
    @Param('subjectName') subjectName: string,
  ): Promise<SubjectRoadmapDetailDto> {
    return this.academicService.getSubjectRoadmapDetail(req.user.id, subjectName);
  }

  @Post('class/:classId/module')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Create a learning module for a class (Teacher only)' })
  @ApiResponse({
    status: 201,
    description: 'Module created successfully',
    type: SubjectModuleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only teachers can create modules' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  async createSubjectModule(
    @Request() req: AuthenticatedRequest,
    @Param('classId') classId: string,
    @Body() createModuleDto: CreateSubjectModuleDto,
  ): Promise<SubjectModuleResponseDto> {
    return this.academicService.createSubjectModule(req.user.id, classId, createModuleDto);
  }

  @Get('live-sessions')
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'Get all live classes/sessions' })
  @ApiResponse({
    status: 200,
    description: 'Live sessions retrieved successfully',
    type: [LiveSessionDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getLiveClasses(@Request() req: AuthenticatedRequest): Promise<LiveSessionDto[]> {
    return this.academicService.getLiveClasses(req.user.id);
  }

  @Get('live-sessions/:sessionId')
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'Get details of a live class' })
  @ApiResponse({
    status: 200,
    description: 'Live session details retrieved',
    type: LiveSessionDetailDto,
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getLiveSessionDetail(
    @Request() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
  ): Promise<LiveSessionDetailDto> {
    return this.academicService.getLiveSessionDetail(req.user.id, sessionId);
  }

  @Post('live-sessions/:sessionId/join')
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'Join a live class session' })
  @ApiResponse({
    status: 201,
    description: 'Joined session successfully',
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async joinLiveSession(
    @Request() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
  ): Promise<{ message: string }> {
    return this.academicService.joinLiveSession(req.user.id, sessionId);
  }

  @Post('live-sessions/:sessionId/leave')
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'Leave a live class session' })
  @ApiResponse({
    status: 201,
    description: 'Left session successfully',
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async leaveLiveSession(
    @Request() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
  ): Promise<{ message: string }> {
    return this.academicService.leaveLiveSession(req.user.id, sessionId);
  }

  @Post('live-sessions/:sessionId/reminder')
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'Schedule a reminder for a live class' })
  @ApiResponse({
    status: 201,
    description: 'Reminder scheduled',
  })
  async scheduleReminder(
    @Request() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
    @Body() reminderDto: ScheduleReminderDto,
  ): Promise<{ message: string }> {
    return this.academicService.scheduleSessionReminder(req.user.id, sessionId, reminderDto.minutesBefore);
  }

  @Post('live-sessions/:sessionId/message')
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT, UserRole.TEACHER)
  @ApiOperation({ summary: 'Send a message in a live class session' })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
    type: LiveSessionMessageDto,
  })
  async sendLiveSessionMessage(
    @Request() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
    @Body() sendDto: SendLiveSessionMessageDto,
  ): Promise<LiveSessionMessageDto> {
    return this.academicService.sendLiveSessionMessage(req.user.id, sessionId, sendDto);
  }

  @Get('live-sessions/:sessionId/messages')
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get all messages for a live class session' })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
    type: [LiveSessionMessageDto],
  })
  async getLiveSessionMessages(
    @Request() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
  ): Promise<LiveSessionMessageDto[]> {
    return this.academicService.getLiveSessionMessages(req.user.id, sessionId);
  }

  @Post('class-activities/:classActivityId/start')
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'Start a class activity' })
  @ApiResponse({
    status: 201,
    description: 'Class activity started successfully',
    type: StartClassActivityResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Class activity already submitted' })
  @ApiResponse({ status: 403, description: 'Not registered for the class' })
  @ApiResponse({ status: 404, description: 'Class activity not found' })
  async startClassActivity(
    @Request() req: AuthenticatedRequest,
    @Param('classActivityId') classActivityId: string,
  ): Promise<StartClassActivityResponseDto> {
    return this.academicService.startClassActivity(req.user.id, classActivityId);
  }

  @Get('class-activities/:classActivityId/questions')
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'Get class activity questions with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Questions retrieved successfully',
    type: ClassActivityQuestionsResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Class activity not started' })
  @ApiResponse({ status: 404, description: 'Class activity not found' })
  async getClassActivityQuestions(
    @Request() req: AuthenticatedRequest,
    @Param('classActivityId') classActivityId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ClassActivityQuestionsResponseDto> {
    return this.academicService.getClassActivityQuestions(req.user.id, classActivityId, Number(page), Number(limit));
  }

  @Get('class-activities/:classActivityId')
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'Get class activity details' })
  @ApiResponse({
    status: 200,
    description: 'Class activity details retrieved successfully',
    type: ClassActivityDetailDto,
  })
  @ApiResponse({ status: 404, description: 'Class activity not found' })
  async getClassActivityDetail(
    @Request() req: AuthenticatedRequest,
    @Param('classActivityId') classActivityId: string,
  ): Promise<ClassActivityDetailDto> {
    return this.academicService.getClassActivityDetail(req.user.id, classActivityId);
  }

  @Post('class-activities/:classActivityId/submit')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'Submit a class activity attempt' })
  @ApiResponse({
    status: 200,
    description: 'Class activity submitted and scored',
  })
  @ApiResponse({ status: 400, description: 'Class activity already submitted or not started' })
  async submitClassActivity(
    @Request() req: AuthenticatedRequest,
    @Param('classActivityId') classActivityId: string,
    @Body() submitDto: SubmitClassActivityDto,
  ): Promise<{ message: string; score: number }> {
    return this.academicService.submitClassActivity(req.user.id, classActivityId, submitDto);
  }

  @Get('classes/:classId/learning-materials')
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'Get all learning materials for a class' })
  @ApiResponse({
    status: 200,
    description: 'Learning materials retrieved successfully',
    type: [LearningMaterialDto],
  })
  @ApiResponse({ status: 403, description: 'Not registered for this class' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  async getLearningMaterials(
    @Request() req: AuthenticatedRequest,
    @Param('classId') classId: string,
  ): Promise<LearningMaterialDto[]> {
    return this.academicService.getLearningMaterials(req.user.id, classId);
  }

  @Get('learning-materials/:materialId')
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'Get details of a learning material including lecture notes' })
  @ApiResponse({
    status: 200,
    description: 'Learning material details retrieved successfully',
    type: LearningMaterialDetailDto,
  })
  @ApiResponse({ status: 404, description: 'Learning material not found' })
  async getLearningMaterialDetail(
    @Request() req: AuthenticatedRequest,
    @Param('materialId') materialId: string,
  ): Promise<LearningMaterialDetailDto> {
    return this.academicService.getLearningMaterialDetail(req.user.id, materialId);
  }

  @Get('assignments')
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'Get student assignments with filtering' })
  @ApiQuery({
    name: 'filter',
    enum: AssignmentFilter,
    required: false,
    description: 'Filter assignments by their status (all, pending, or submitted)',
  })
  @ApiResponse({
    status: 200,
    description: 'Assignments retrieved successfully',
    type: [AssignmentResponseDto],
  })
  async getAssignments(
    @Request() req: AuthenticatedRequest,
    @Query('filter') filter: AssignmentFilter = AssignmentFilter.ALL,
  ): Promise<AssignmentResponseDto[]> {
    return this.academicService.getAssignments(req.user.id, filter);
  }

  @Get('assignments/:assignmentId')
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'Get full details of an assignment including student submission status' })
  @ApiResponse({
    status: 200,
    description: 'Assignment details retrieved successfully',
    type: AssignmentDetailDto,
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  async getAssignmentDetail(
    @Request() req: AuthenticatedRequest,
    @Param('assignmentId') assignmentId: string,
  ): Promise<AssignmentDetailDto> {
    return this.academicService.getAssignmentDetail(req.user.id, assignmentId);
  }

  @Post('assignments/:assignmentId/start')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'Mark an assignment as in-progress' })
  @ApiResponse({
    status: 200,
    description: 'Assignment started successfully',
    type: StartAssignmentResponseDto,
  })
  async startAssignment(
    @Request() req: AuthenticatedRequest,
    @Param('assignmentId') assignmentId: string,
  ): Promise<StartAssignmentResponseDto> {
    return this.academicService.startAssignment(req.user.id, assignmentId);
  }

  @Post('assignments/:assignmentId/preview')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'Preview assignment submission before final submission' })
  @ApiResponse({
    status: 200,
    description: 'Submission preview generated',
  })
  async previewAssignmentSubmission(
    @Request() req: AuthenticatedRequest,
    @Param('assignmentId') assignmentId: string,
    @Body() submitDto: SubmitAssignmentDto,
  ): Promise<any> {
    return this.academicService.previewAssignmentSubmission(req.user.id, assignmentId, submitDto);
  }

  @Get('assignments/:assignmentId/submission')
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'View the submission details for an assignment' })
  @ApiResponse({
    status: 200,
    description: 'Submission details retrieved successfully',
    type: SubmissionViewDto,
  })
  @ApiResponse({ status: 400, description: 'No submission found or assignment not yet submitted' })
  async viewAssignmentSubmission(
    @Request() req: AuthenticatedRequest,
    @Param('assignmentId') assignmentId: string,
  ): Promise<SubmissionViewDto> {
    return this.academicService.viewAssignmentSubmission(req.user.id, assignmentId);
  }

  @Post('assignments/:assignmentId/save-draft')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'Save an assignment as a draft' })
  @ApiResponse({
    status: 200,
    description: 'Assignment draft saved successfully',
    type: SubmissionViewDto,
  })
  async saveAssignmentDraft(
    @Request() req: AuthenticatedRequest,
    @Param('assignmentId') assignmentId: string,
    @Body() submitDto: SubmitAssignmentDto,
  ): Promise<SubmissionViewDto> {
    return this.academicService.saveAssignmentDraft(req.user.id, assignmentId, submitDto);
  }

  @Post('assignments/:assignmentId/submit')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'Submit an assignment for grading' })
  @ApiResponse({
    status: 200,
    description: 'Assignment submitted successfully',
    type: SubmissionViewDto,
  })
  async submitAssignment(
    @Request() req: AuthenticatedRequest,
    @Param('assignmentId') assignmentId: string,
    @Body() submitDto: SubmitAssignmentDto,
  ): Promise<SubmissionViewDto> {
    return this.academicService.submitAssignment(req.user.id, assignmentId, submitDto);
  }

  @Get('class-activities')
  @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'Get student class activities/examinations with filtering' })
  @ApiQuery({
    name: 'filter',
    enum: ClassActivityFilter,
    required: false,
    description: 'Filter activities by their status (all, upcoming, or past)',
  })
  @ApiResponse({
    status: 200,
    description: 'Class activities retrieved successfully',
    type: [ClassActivityResponseDto],
  })
  async getClassActivities(
    @Request() req: AuthenticatedRequest,
    @Query('filter') filter: ClassActivityFilter = ClassActivityFilter.ALL,
  ): Promise<ClassActivityResponseDto[]> {
    return this.academicService.getClassActivities(req.user.id, filter);
  }
}

