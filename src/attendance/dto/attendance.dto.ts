import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
    leaveType: LeaveType;

    @ApiProperty()
    fromDate: string;

    @ApiProperty()
    toDate: string;

    @ApiProperty()
    reason: string;

    @ApiPropertyOptional()
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
