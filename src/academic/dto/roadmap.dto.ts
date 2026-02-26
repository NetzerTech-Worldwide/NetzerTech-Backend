import { ApiProperty } from '@nestjs/swagger';

export enum SubjectStatus {
    NOT_STARTED = 'Not Started',
    IN_PROGRESS = 'In Progress',
    COMPLETED = 'Completed',
}

export class SubjectRoadmapItemDto {
    @ApiProperty({ description: 'Subject name', example: 'Mathematics' })
    subject: string;

    @ApiProperty({ description: 'Duration of the subject course', example: '12 weeks' })
    duration: string;

    @ApiProperty({ description: 'Start date', example: '2024-01-15' })
    startDate: Date;

    @ApiProperty({ description: 'End date', example: '2024-04-15' })
    endDate: Date;

    @ApiProperty({ description: 'Status of the subject', enum: SubjectStatus })
    status: SubjectStatus;

    @ApiProperty({ description: 'Progress percentage', example: 45 })
    progress: number;

    @ApiProperty({ description: 'Class level', example: 'ss3' })
    classLevel: string;
}

export class AllSubjectsRoadmapDto {
    @ApiProperty({ type: [SubjectRoadmapItemDto], description: 'List of subject learning roadmaps' })
    roadmaps: SubjectRoadmapItemDto[];
}

export class SubjectMilestoneDto {
    @ApiProperty({ description: 'Title of the milestone (e.g. Session/Term)', example: '2024/2025 First Term' })
    title: string;

    @ApiProperty({ description: 'Session Year', example: '2024/2025' })
    sessionYear: string;

    @ApiProperty({ description: 'Term', example: 'First Term' })
    term: string;

    @ApiProperty({ description: 'Class level', example: 'ss3' })
    level: string;

    @ApiProperty({ description: 'Status', enum: SubjectStatus })
    status: SubjectStatus;

    @ApiProperty({ description: 'Grade obtained', required: false, example: 85 })
    grade?: number;

    @ApiProperty({ description: 'Start date', example: '2024-01-15' })
    startDate: Date;

    @ApiProperty({ description: 'End date', example: '2024-04-15' })
    endDate: Date;

    @ApiProperty({ description: 'Modules covered', required: false })
    modules?: any[];
}

export class SubjectRoadmapDetailDto {
    @ApiProperty({ description: 'Subject name', example: 'Mathematics' })
    subject: string;

    @ApiProperty({ description: 'Overall progress', example: 60 })
    overallProgress: number;

    @ApiProperty({ type: [SubjectMilestoneDto], description: 'Timeline of the subject' })
    milestones: SubjectMilestoneDto[];
}
