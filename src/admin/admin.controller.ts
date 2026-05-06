import { Controller, Get, Post, Body, Headers, UnauthorizedException, InternalServerErrorException, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DatabaseSeeder } from '../database/seeder';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { 
    AdminClassOverviewDto, 
    AdminStudentDto, 
    AdminTeacherDto, 
    AdminParentDto,
    CreateStudentWithParentDto,
    AdminSystemUserDto,
    CreateClassDto,
    CreateTeacherDto,
    CreateSystemUserDto,
    CreateParentDto,
    CreateAnnouncementDto,
    CreateEventDto,
    CreateTimetablePeriodDto,
    CreateExamTimetableDto,
    SendIdCardsToVendorDto,
} from './dto/admin.dto';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private readonly adminService: AdminService
  ) {}

  @Post('seed')
  @ApiOperation({ summary: 'Trigger database seeding (requires secret key)' })
  @ApiHeader({ name: 'x-seed-secret', description: 'Secret key to authorize seeding' })
  async runSeed(@Headers('x-seed-secret') secret: string) {
    const expectedSecret = process.env.SEED_SECRET;

    if (!expectedSecret) {
      throw new InternalServerErrorException('SEED_SECRET environment variable is not configured');
    }

    if (!secret || secret !== expectedSecret) {
      throw new UnauthorizedException('Invalid seed secret');
    }

    try {
      const seeder = new DatabaseSeeder(this.dataSource);
      await seeder.seed();
      return { message: 'Database seeded successfully' };
    } catch (error) {
      console.error('Database seeding failed:', error.message);
      throw new InternalServerErrorException('Database seeding failed. Check server logs for details.');
    }
  }

  @Get('classes/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get classes overview with student counts' })
  @ApiResponse({ status: 200, type: [AdminClassOverviewDto] })
  async getClassesOverview(@Request() req) {
      return this.adminService.getClassesOverview(req.user.id);
  }

  @Post('classes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new class' })
  async createClass(@Request() req, @Body() dto: CreateClassDto) {
      return this.adminService.createClass(dto, req.user.id);
  }

  @Get('students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all students detailed list' })
  @ApiResponse({ status: 200, type: [AdminStudentDto] })
  async getStudents(@Request() req) {
      return this.adminService.getStudents(req.user.id);
  }

  @Post('students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new student and their parent/guardian' })
  async createStudentWithParent(@Request() req, @Body() dto: CreateStudentWithParentDto) {
      return this.adminService.createStudentWithParent(dto, req.user.id);
  }

  @Get('teachers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all teachers' })
  @ApiResponse({ status: 200, type: [AdminTeacherDto] })
  async getTeachers(@Request() req) {
      return this.adminService.getTeachers(req.user.id);
  }

  @Post('teachers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new teacher' })
  @ApiResponse({ status: 201, description: 'Teacher created successfully' })
  async createTeacher(@Request() req, @Body() dto: CreateTeacherDto) {
      return this.adminService.createTeacher(dto, req.user.id);
  }

  @Get('parents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all parents' })
  @ApiResponse({ status: 200, type: [AdminParentDto] })
  async getParents(@Request() req) {
      return this.adminService.getParents(req.user.id);
  }

  @Post('parents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new parent' })
  @ApiResponse({ status: 201, description: 'Parent created successfully' })
  async createParent(@Request() req, @Body() dto: CreateParentDto) {
      return this.adminService.createParent(dto, req.user.id);
  }

  @Get('system-users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all system users (admins and staff)' })
  @ApiResponse({ status: 200, type: [AdminSystemUserDto] })
  async getSystemUsers(@Request() req) {
      return this.adminService.getSystemUsers(req.user.id);
  }

  @Post('system-users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new system user (admin/staff)' })
  @ApiResponse({ status: 201, description: 'System user created successfully' })
  async createSystemUser(@Request() req, @Body() dto: CreateSystemUserDto) {
      return this.adminService.createSystemUser(dto, req.user.id);
  }

  @Get('dashboard-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats(@Request() req) {
      return this.adminService.getDashboardStats(req.user.id);
  }

  @Post('announcements')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new announcement' })
  @ApiResponse({ status: 201, description: 'Announcement created successfully' })
  async createAnnouncement(@Request() req, @Body() dto: CreateAnnouncementDto) {
      return this.adminService.createAnnouncement(dto, req.user.id);
  }

  @Post('events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new school event' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  async createEvent(@Request() req, @Body() dto: CreateEventDto) {
      return this.adminService.createEvent(dto, req.user.id);
  }

  @Post('timetable/periods')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a timetable period' })
  @ApiResponse({ status: 201, description: 'Timetable period created successfully' })
  async createTimetablePeriod(@Request() req, @Body() dto: CreateTimetablePeriodDto) {
      return this.adminService.createTimetablePeriod(dto, req.user.id);
  }

  @Post('examinations/timetable')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create an examination timetable entry' })
  @ApiResponse({ status: 201, description: 'Examination timetable created successfully' })
  async createExamTimetable(@Request() req, @Body() dto: CreateExamTimetableDto) {
      return this.adminService.createExamTimetable(dto, req.user.id);
  }

  @Post('id-cards/send-to-vendor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Send ID card order to vendor' })
  @ApiResponse({ status: 201, description: 'ID card order sent successfully' })
  async sendIdCardsToVendor(@Request() req, @Body() dto: SendIdCardsToVendorDto) {
      return this.adminService.sendIdCardsToVendor(dto, req.user.id);
  }
}
