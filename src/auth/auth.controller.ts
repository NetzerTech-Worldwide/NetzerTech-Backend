import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
  BadRequestException,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  StudentLoginDto,
  ParentLoginDto,
  TeacherAdminLoginDto,
  TeacherLoginDto,
  UniversityStudentLoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  AuthResponseDto,
} from './dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login/student/secondary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Student login' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async studentLogin(@Body() studentLoginDto: StudentLoginDto) {
    const user = await this.authService.validateStudent(studentLoginDto);
    return this.authService.login(user);
  }

  @Post('login/student/university')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'University student login' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async universityStudentLogin(@Body() universityLoginDto: UniversityStudentLoginDto) {
    const user = await this.authService.validateUniversityStudent(universityLoginDto);
    return this.authService.login(user);
  }

  @Post('login/parent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Parent login' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async parentLogin(@Body() parentLoginDto: ParentLoginDto) {
    const user = await this.authService.validateParent(parentLoginDto);
    return this.authService.login(user);
  }

  @Post('login/teacher')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Teacher login' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async teacherLogin(@Body() loginDto: TeacherLoginDto) {
    const user = await this.authService.validateTeacher(loginDto);
    return this.authService.login(user);
  }

  @Post('login/admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async adminLogin(@Body() loginDto: TeacherAdminLoginDto) {
    const user = await this.authService.validateAdmin(loginDto);
    return this.authService.login(user);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset token generated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user and invalidate token' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Request() req: AuthenticatedRequest) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      throw new BadRequestException('Token not found');
    }

    return this.authService.logout(token, req.user.id);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change password',
    description: 'For first-time login: requires newPassword and confirmPassword only. For regular password change: requires currentPassword and newPassword.'
  })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized or invalid current password' })
  @ApiResponse({ status: 400, description: 'Validation error (passwords do not match, same as current password, etc.)' })
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req: AuthenticatedRequest) {
    return this.authService.getUserProfile(req.user);
  }
}
