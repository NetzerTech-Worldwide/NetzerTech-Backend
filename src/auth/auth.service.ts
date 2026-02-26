import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User, Student, Parent, Teacher, Admin, PasswordResetToken, BlacklistedToken } from '../entities';
import { MailService } from '../mail/mail.service';
import { UserRole } from '../common/enums/user-role.enum';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import {
  StudentLoginDto,
  ParentLoginDto,
  TeacherAdminLoginDto,
  TeacherLoginDto,
  UniversityStudentLoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(BlacklistedToken)
    private blacklistedTokenRepository: Repository<BlacklistedToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) { }

  async validateStudent(studentLoginDto: StudentLoginDto): Promise<User> {
    const { studentId, fullName, password } = studentLoginDto;

    const student = await this.studentRepository.findOne({
      where: { studentId },
      relations: ['user', 'parent'],
    });

    if (!student) {
      throw new UnauthorizedException('Invalid student ID');
    }

    if (student.fullName.toLowerCase() !== fullName.toLowerCase()) {
      throw new UnauthorizedException('Student name does not match');
    }

    const user = student.user;
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return user;
  }

  async validateUniversityStudent(universityLoginDto: UniversityStudentLoginDto): Promise<User> {
    const { matricNumber, password } = universityLoginDto;

    const student = await this.studentRepository.findOne({
      where: { matricNumber },
      relations: ['user'],
    });

    if (!student) {
      throw new UnauthorizedException('Invalid matric number');
    }

    const user = student.user;
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return user;
  }

  async validateParent(parentLoginDto: ParentLoginDto): Promise<User> {
    const { email, studentId, password } = parentLoginDto;

    const parent = await this.parentRepository.findOne({
      where: { user: { email } },
      relations: ['user', 'children'],
    });

    if (!parent) {
      throw new UnauthorizedException('Parent account not found');
    }

    const user = parent.user;
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Check if the student ID belongs to this parent
    const hasChild = parent.children.some(child => child.studentId === studentId);
    if (!hasChild) {
      throw new UnauthorizedException('Student ID does not belong to this parent');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return user;
  }

  async validateTeacher(loginDto: TeacherLoginDto): Promise<User> {
    const { staffId, password } = loginDto;

    const teacher = await this.teacherRepository.findOne({
      where: { employeeId: staffId },
      relations: ['user'],
    });

    if (!teacher) {
      throw new UnauthorizedException('Invalid staff ID');
    }

    const user = teacher.user;
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.userType !== UserRole.TEACHER) {
      throw new UnauthorizedException('Invalid user type');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return user;
  }

  async validateAdmin(loginDto: TeacherAdminLoginDto): Promise<User> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['admin'],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.userType !== UserRole.ADMIN) {
      throw new UnauthorizedException('Invalid user type');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return user;
  }

  async validateTeacherAdmin(loginDto: TeacherAdminLoginDto): Promise<User> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['teacher', 'admin'],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (![UserRole.TEACHER, UserRole.ADMIN].includes(user.userType)) {
      throw new UnauthorizedException('Invalid user type');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return user;
  }

  async login(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
    };

    const accessToken = this.jwtService.sign(payload);

    // Update last login
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    // Always include mustChangePassword to track first-time users
    const response: any = {
      accessToken,
      mustChangePassword: user.mustChangePassword,
    };

    // If password has been changed, include full profile information
    if (!user.mustChangePassword) {
      response.user = this.getUserProfile(user);
    } else {
      // For first-time users, return minimal user info
      response.user = {
        id: user.id,
        email: user.email,
        userType: user.userType,
        isActive: user.isActive,
      };
      response.message = 'Password change required on first login';
    }

    return response;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isFirstTimeLogin = user.mustChangePassword;

    // For first-time login: require newPassword and confirmPassword only
    if (isFirstTimeLogin) {
      if (!confirmPassword) {
        throw new BadRequestException('Confirm password is required for first-time login');
      }

      if (newPassword !== confirmPassword) {
        throw new BadRequestException('New password and confirm password do not match');
      }

      // Check if new password is different from the temporary password
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        throw new BadRequestException('New password must be different from the temporary password');
      }
    } else {
      // For regular password change: require currentPassword
      if (!currentPassword) {
        throw new BadRequestException('Current password is required');
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Check if new password is different from current password
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        throw new BadRequestException('New password must be different from current password');
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and reset mustChangePassword flag
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      mustChangePassword: false,
      passwordChangedAt: new Date(),
    });

    return {
      message: 'Password changed successfully',
    };
  }

  getUserProfile(user: User) {
    const baseProfile = {
      id: user.id,
      email: user.email,
      userType: user.userType,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
    };

    switch (user.userType) {
      case UserRole.SECONDARY_STUDENT:
        return {
          ...baseProfile,
          studentId: user.student?.studentId,
          fullName: user.student?.fullName,
          dateOfBirth: user.student?.dateOfBirth,
          grade: user.student?.grade,
          school: user.student?.school,
          gender: user.student?.gender,
        };

      case UserRole.UNIVERSITY_STUDENT:
        return {
          ...baseProfile,
          studentId: user.student?.studentId,
          matricNumber: user.student?.matricNumber,
          fullName: user.student?.fullName,
          dateOfBirth: user.student?.dateOfBirth,
          grade: user.student?.grade,
          school: user.student?.school,
          gender: user.student?.gender,
        };

      case UserRole.PARENT:
        return {
          ...baseProfile,
          fullName: user.parent?.fullName,
          phoneNumber: user.parent?.phoneNumber,
          address: user.parent?.address,
        };

      case UserRole.TEACHER:
        return {
          ...baseProfile,
          fullName: user.teacher?.fullName,
          employeeId: user.teacher?.employeeId,
          department: user.teacher?.department,
          phoneNumber: user.teacher?.phoneNumber,
          address: user.teacher?.address,
        };

      case UserRole.ADMIN:
        return {
          ...baseProfile,
          fullName: user.admin?.fullName,
          employeeId: user.admin?.employeeId,
          department: user.admin?.department,
          phoneNumber: user.admin?.phoneNumber,
          address: user.admin?.address,
          isSuperAdmin: user.admin?.isSuperAdmin,
        };

      default:
        return baseProfile;
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }

    // Generate reset token
    const token = this.generateResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Save reset token
    const resetToken = this.passwordResetTokenRepository.create({
      token,
      expiresAt,
      user,
    });

    await this.passwordResetTokenRepository.save(resetToken);

    // Send reset email
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    
    await this.mailService.sendPasswordResetEmail(user.email, resetUrl);

    return {
      message: 'Password reset link sent to your email',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword, confirmPassword } = resetPasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { token, isUsed: false },
      relations: ['user'],
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid reset token');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await this.userRepository.update(resetToken.user.id, {
      password: hashedPassword,
      passwordChangedAt: new Date(),
    });

    // Mark token as used
    await this.passwordResetTokenRepository.update(resetToken.id, {
      isUsed: true,
    });

    return {
      message: 'Password reset successfully',
    };
  }

  async logout(token: string, userId: string): Promise<{ message: string }> {
    // Decode token to get expiration time
    const decoded = this.jwtService.decode(token) as JwtPayload;

    if (!decoded || !decoded.exp) {
      throw new BadRequestException('Invalid token');
    }

    // Calculate expiration date from token
    const expiresAt = new Date(decoded.exp * 1000);

    // Check if token is already blacklisted
    const existingBlacklist = await this.blacklistedTokenRepository.findOne({
      where: { token },
    });

    if (existingBlacklist) {
      return { message: 'Token already revoked' };
    }

    // Get user to associate with blacklisted token
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    // Create blacklisted token entry
    const blacklistedToken = this.blacklistedTokenRepository.create({
      token,
      expiresAt,
      user: user || undefined,
    });

    await this.blacklistedTokenRepository.save(blacklistedToken);

    return { message: 'Logged out successfully' };
  }

  private generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
