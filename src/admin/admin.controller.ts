import { Controller, Get, Post, Body, Headers, UnauthorizedException, InternalServerErrorException, UseGuards } from '@nestjs/common';
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
    AdminSystemUserDto
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
  async getClassesOverview() {
      return this.adminService.getClassesOverview();
  }

  @Get('students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all students detailed list' })
  @ApiResponse({ status: 200, type: [AdminStudentDto] })
  async getStudents() {
      return this.adminService.getStudents();
  }

  @Post('students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new student and their parent/guardian' })
  async createStudentWithParent(@Body() dto: CreateStudentWithParentDto) {
      return this.adminService.createStudentWithParent(dto);
  }

  @Get('teachers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all teachers' })
  @ApiResponse({ status: 200, type: [AdminTeacherDto] })
  async getTeachers() {
      return this.adminService.getTeachers();
  }

  @Get('parents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all parents' })
  @ApiResponse({ status: 200, type: [AdminParentDto] })
  async getParents() {
      return this.adminService.getParents();
  }

  @Get('system-users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all system users (admins and staff)' })
  @ApiResponse({ status: 200, type: [AdminSystemUserDto] })
  async getSystemUsers() {
      return this.adminService.getSystemUsers();
  }
}
