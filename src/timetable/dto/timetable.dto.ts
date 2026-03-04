import { ApiProperty } from '@nestjs/swagger';

export class TimetableEventDto {
    @ApiProperty({ description: 'The unique ID of the class or session' })
    id: string;

    @ApiProperty({ description: 'Name of the class/subject', example: 'Mathematics' })
    title: string;

    @ApiProperty({ description: 'Event type', example: 'class' })
    type: 'class' | 'live-session';

    @ApiProperty({ description: 'Category for UI filtering', example: 'compulsory' })
    category: 'compulsory' | 'elective' | 'extra';

    @ApiProperty({ description: 'Start time of the event' })
    startTime: Date;

    @ApiProperty({ description: 'End time of the event' })
    endTime: Date;

    @ApiProperty({ description: 'Pre-formatted relative duration', example: '1 hr 20 mins' })
    duration: string;

    @ApiProperty({ description: 'Name of the assigned instructor' })
    teacherName: string;

    @ApiProperty({ description: 'Physical or virtual location' })
    location: string;

    @ApiProperty({ description: 'Detailed description of the event or class', nullable: true })
    description: string | null;

    @ApiProperty({ description: 'Virtual meeting URL if applicable', nullable: true })
    meetingUrl: string | null;

    @ApiProperty({ description: 'Current status based on server time', example: 'upcoming' })
    status: 'ongoing' | 'upcoming' | 'completed';
}

export class DailyTimetableDto {
    @ApiProperty({ description: 'The requested date', example: '2024-05-23' })
    date: string;

    @ApiProperty({ type: [TimetableEventDto], description: 'Chronologically sorted list of events for the day' })
    events: TimetableEventDto[];
}

export class TimetableJoinDto {
    @ApiProperty({ description: 'The ID of the Class or LiveSession to join or log attendance for' })
    eventId: string;

    @ApiProperty({ description: 'The type of the event getting joined' })
    type: 'class' | 'live-session';
}
