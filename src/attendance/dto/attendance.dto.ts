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
}
