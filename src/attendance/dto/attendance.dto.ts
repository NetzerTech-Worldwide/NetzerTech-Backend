import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsNotEmpty, IsEnum, IsDateString } from 'class-validator';
import { LeaveType } from '../../entities/leave-request.entity';

export class AttendanceOverviewDto {
    @ApiProperty()
    totalClasses: number;

    @ApiProperty()
    present: number;

    @ApiProperty()
    absent: number;

    @ApiProperty()
    late: number;

    @ApiProperty()
    excused: number;

    @ApiProperty()
    attendancePercentage: number;

    @ApiProperty()
    recentAttendance: any[];
}

export class CreateLeaveRequestDto {
    @ApiProperty({ enum: LeaveType })
    @IsEnum(LeaveType)
    @IsNotEmpty()
    leaveType: LeaveType;

    @ApiProperty()
    @IsDateString()
    @IsNotEmpty()
    fromDate: string;

    @ApiProperty()
    @IsDateString()
    @IsNotEmpty()
    toDate: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    reason: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    supportingDocumentUrl?: string;
}

export class LeaveRequestStatsDto {
    @ApiProperty()
    total: number;

    @ApiProperty()
    pending: number;

    @ApiProperty()
    approved: number;

    @ApiProperty()
    rejected: number;
}

export class LeaveRequestDetailDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ enum: LeaveType })
    requestType: LeaveType;

    @ApiProperty()
    dateSubmitted: string;

    @ApiProperty()
    leaveDate: string;

    @ApiProperty()
    returnDate: string;

    @ApiProperty()
    status: string;

    @ApiProperty()
    approvedBy: string;

    @ApiProperty()
    reason: string;

    @ApiPropertyOptional()
    adminComments?: string;

    @ApiPropertyOptional()
    supportingDocumentUrl?: string;
}

export class UpdateLeaveRequestDto {
    @ApiProperty({ enum: ['pending', 'approved', 'rejected'] })
    @IsString()
    @IsNotEmpty()
    status: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    adminComments?: string;
}

export class AdminClassAttendanceDto {
    @ApiProperty()
    class: string;

    @ApiProperty()
    students: number;

    @ApiProperty()
    avgAttendance: number;

    @ApiProperty()
    totalPresent: number;

    @ApiProperty()
    totalAbsent: number;

    @ApiProperty()
    totalLate: number;

    @ApiProperty()
    totalExcused: number;

    @ApiProperty()
    classTeacher: string;
}

export class AdminStudentAttendanceDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    class: string;

    @ApiProperty()
    totalDays: number;

    @ApiProperty()
    present: number;

    @ApiProperty()
    absent: number;

    @ApiProperty()
    late: number;

    @ApiProperty()
    excused: number;

    @ApiProperty()
    attendanceRate: number;
}
