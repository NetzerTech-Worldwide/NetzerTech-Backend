import { ApiProperty } from '@nestjs/swagger';
import { LiveSessionStatus } from '../../entities/live-session.entity';

export class LiveSessionDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    startTime: Date;

    @ApiProperty()
    endTime: Date;

    @ApiProperty({ enum: LiveSessionStatus })
    status: LiveSessionStatus;

    @ApiProperty({ description: 'Whether the student can join now' })
    canJoin: boolean;

    @ApiProperty({ required: false })
    meetingUrl?: string;

    @ApiProperty()
    subjectName: string;

    @ApiProperty()
    className: string;

    @ApiProperty({ description: 'Name of the teacher hosting the session' })
    teacherName: string;
}

export class LiveSessionDetailDto extends LiveSessionDto {
    @ApiProperty()
    totalParticipants: number;

    @ApiProperty()
    totalClassStudents: number;

    @ApiProperty({ type: 'array', items: { type: 'object' } }) // Simplified for brevity in this example
    participants: any[]; // Or create a StudentSummaryDto
}

export class ScheduleReminderDto {
    @ApiProperty({ description: 'Minutes before session to remind', example: 15, default: 15, required: false })
    minutesBefore?: number;
}
