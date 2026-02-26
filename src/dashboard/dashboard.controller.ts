import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import {
  SecondaryStudentDashboardDto,
  UniversityStudentDashboardDto,
  TeacherDashboardDto,
  ParentDashboardDto,
} from './dto';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('secondary-student')
  @Roles(UserRole.SECONDARY_STUDENT)
  @ApiOperation({ summary: 'Get secondary student dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    type: SecondaryStudentDashboardDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Invalid role' })
  async getSecondaryStudentDashboard(@Request() req: AuthenticatedRequest) {
    return this.dashboardService.getSecondaryStudentDashboard(req.user.id);
  }

  @Get('university-student')
  @Roles(UserRole.UNIVERSITY_STUDENT)
  @ApiOperation({ summary: 'Get university student dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    type: UniversityStudentDashboardDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Invalid role' })
  async getUniversityStudentDashboard(@Request() req: AuthenticatedRequest) {
    return this.dashboardService.getUniversityStudentDashboard(req.user.id);
  }

  @Get('teacher')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Get teacher dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    type: TeacherDashboardDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Invalid role' })
  async getTeacherDashboard(@Request() req: AuthenticatedRequest) {
    return this.dashboardService.getTeacherDashboard(req.user.id);
  }

  @Get('parent')
  @Roles(UserRole.PARENT)
  @ApiOperation({ summary: 'Get parent dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    type: ParentDashboardDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Invalid role' })
  async getParentDashboard(@Request() req: AuthenticatedRequest) {
    return this.dashboardService.getParentDashboard(req.user.id);
  }
}

