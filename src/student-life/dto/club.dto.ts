import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClubStatus } from '../../entities/club.entity';

export class ClubStatsDto {
    @ApiProperty()
    clubsJoined: number;

    @ApiProperty()
    participationCredits: number;

    @ApiProperty()
    leadershipRoles: number;
}

export class ClubOverviewDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    memberCount: number;

    @ApiProperty()
    meetingDay: string;

    @ApiProperty()
    isJoined: boolean;

    @ApiProperty({ enum: ['pending', 'approved', 'rejected'] })
    status: string;

    @ApiPropertyOptional()
    role?: string;

    @ApiPropertyOptional()
    creditsEarned?: number;
}

export class CreateClubDto {
    @ApiProperty({ example: 'Robotics Club' })
    name: string;

    @ApiProperty({ example: 'Learn to build robots.' })
    description: string;

    @ApiProperty({ example: 'Monday', description: 'Preferred Meeting Day' })
    meetingDay: string;

    @ApiPropertyOptional({ example: 'Dr. Sarah Wilson' })
    teacherAdvisor?: string;
}

export class ClubEventDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    clubName: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    date: string;

    @ApiProperty()
    startTime: string;

    @ApiProperty()
    endTime: string;

    @ApiProperty()
    location: string;
}

export class ClubMemberDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    credits: number;

    @ApiProperty()
    className: string;

    @ApiProperty()
    role: string;
}

export class ClubAnnouncementDto {
    @ApiProperty()
    title: string;

    @ApiProperty()
    content: string;

    @ApiProperty()
    postedBy: string;

    @ApiProperty()
    date: string;
}

export class ClubDetailDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    advisorName: string;

    @ApiProperty()
    meetingDay: string;

    @ApiProperty()
    meetingTime: string;

    @ApiProperty()
    totalMembers: number;

    @ApiProperty()
    clubLead: string;

    @ApiProperty({ type: [ClubAnnouncementDto] })
    announcements: ClubAnnouncementDto[];

    @ApiProperty({ type: [ClubMemberDto] })
    members: ClubMemberDto[];
}
