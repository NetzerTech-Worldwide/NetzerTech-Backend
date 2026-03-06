import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { ProfileService } from './profile.service';
import { UpdatePersonalInfoDto, UpdateContactInfoDto, UpdateGuardianInfoDto, UpdatePasswordDto } from './dto/profile.dto';

@ApiTags('profile')
@Controller('profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Get()
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT, UserRole.PARENT)
    @ApiOperation({ summary: 'Get full profile with aggregated metrics' })
    async getProfile(@Request() req) {
        return this.profileService.getProfile(req.user.id);
    }

    @Patch('personal')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Update personal demographic info' })
    async updatePersonalInfo(@Request() req, @Body() body: UpdatePersonalInfoDto) {
        return this.profileService.updatePersonalInfo(req.user.id, body);
    }

    @Patch('contact')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Update contact info' })
    async updateContactInfo(@Request() req, @Body() body: UpdateContactInfoDto) {
        return this.profileService.updateContactInfo(req.user.id, body);
    }

    @Patch('guardian')
    @Roles(UserRole.SECONDARY_STUDENT, UserRole.UNIVERSITY_STUDENT)
    @ApiOperation({ summary: 'Update guardian info' })
    async updateGuardianInfo(@Request() req, @Body() body: UpdateGuardianInfoDto) {
        return this.profileService.updateGuardianInfo(req.user.id, body);
    }

    @Patch('password')
    @ApiOperation({ summary: 'Update user password' })
    async updatePassword(@Request() req, @Body() body: UpdatePasswordDto) {
        return this.profileService.updatePassword(req.user.id, body);
    }
}
