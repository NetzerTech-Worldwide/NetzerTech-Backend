import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';

export class BaseUserProfileDto {
    @ApiProperty({ description: 'User ID', example: 'uuid-123' })
    id: string;

    @ApiProperty({ description: 'User email', example: 'user@example.com' })
    email: string;

    @ApiProperty({
        description: 'User role/type',
        enum: UserRole,
        example: UserRole.SECONDARY_STUDENT
    })
    userType: UserRole;

    @ApiProperty({ description: 'Is user account active', example: true })
    isActive: boolean;

    @ApiProperty({
        description: 'Last login timestamp',
        example: '2024-01-15T10:30:00Z',
        required: false
    })
    lastLoginAt?: Date;
}

export class SecondaryStudentProfileDto extends BaseUserProfileDto {
    @ApiProperty({ description: 'Student ID', example: 'STU001' })
    studentId: string;

    @ApiProperty({ description: 'Full name', example: 'Alice Student' })
    fullName: string;

    @ApiProperty({ description: 'Date of birth', required: false })
    dateOfBirth?: Date;

    @ApiProperty({ description: 'Grade/Class', example: '10', required: false })
    grade?: string;

    @ApiProperty({ description: 'School name', required: false })
    school?: string;

    @ApiProperty({ description: 'Gender', required: false })
    gender?: string;
}

export class UniversityStudentProfileDto extends BaseUserProfileDto {
    @ApiProperty({ description: 'Student ID', example: 'STU002' })
    studentId: string;

    @ApiProperty({ description: 'Matriculation number', example: 'MAT001' })
    matricNumber: string;

    @ApiProperty({ description: 'Full name', example: 'Bob University' })
    fullName: string;

    @ApiProperty({ description: 'Date of birth', required: false })
    dateOfBirth?: Date;

    @ApiProperty({ description: 'Grade/Class', required: false })
    grade?: string;

    @ApiProperty({ description: 'School name', required: false })
    school?: string;

    @ApiProperty({ description: 'Gender', required: false })
    gender?: string;
}

export class TeacherProfileDto extends BaseUserProfileDto {
    @ApiProperty({ description: 'Full name', example: 'John Teacher' })
    fullName: string;

    @ApiProperty({ description: 'Employee/Staff ID', example: 'TCH001', required: false })
    employeeId?: string;

    @ApiProperty({ description: 'Department', required: false })
    department?: string;

    @ApiProperty({ description: 'Phone number', required: false })
    phoneNumber?: string;

    @ApiProperty({ description: 'Address', required: false })
    address?: string;
}

export class ParentProfileDto extends BaseUserProfileDto {
    @ApiProperty({ description: 'Full name', example: 'Jane Parent' })
    fullName: string;

    @ApiProperty({ description: 'Phone number', required: false })
    phoneNumber?: string;

    @ApiProperty({ description: 'Address', required: false })
    address?: string;
}

export class AdminProfileDto extends BaseUserProfileDto {
    @ApiProperty({ description: 'Full name', example: 'Admin User' })
    fullName: string;

    @ApiProperty({ description: 'Employee/Staff ID', required: false })
    employeeId?: string;

    @ApiProperty({ description: 'Department', required: false })
    department?: string;

    @ApiProperty({ description: 'Phone number', required: false })
    phoneNumber?: string;

    @ApiProperty({ description: 'Address', required: false })
    address?: string;

    @ApiProperty({ description: 'Is super admin', example: false })
    isSuperAdmin: boolean;
}

export type UserProfileDto =
    | SecondaryStudentProfileDto
    | UniversityStudentProfileDto
    | TeacherProfileDto
    | ParentProfileDto
    | AdminProfileDto;
