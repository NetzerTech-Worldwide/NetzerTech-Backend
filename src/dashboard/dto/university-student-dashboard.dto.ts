import { ApiProperty } from '@nestjs/swagger';
import { NextClassDto, ClassActivityDto, ReminderDto, ForumTopicDto, EventDto } from './secondary-student-dashboard.dto';

export class UniversityStudentAcademicProgressDto {
  @ApiProperty({ nullable: true })
  cgpa: number | null;

  @ApiProperty({ nullable: true })
  gpa: number | null;

  @ApiProperty({ nullable: true })
  grades: Record<string, number>;

  @ApiProperty({ nullable: true })
  semesterResults: Record<string, any>;

  @ApiProperty()
  totalCredits: number;

  @ApiProperty()
  completedCredits: number;

  @ApiProperty({ description: 'Academic progress percentage' })
  progressPercentage: number;
}

export class UniversityStudentDashboardDto {
  @ApiProperty({ type: NextClassDto, nullable: true })
  nextClass: NextClassDto | null;

  @ApiProperty({ type: [ClassActivityDto] })
  classActivities: ClassActivityDto[];

  @ApiProperty({ nullable: true })
  cgpa: number | null;

  @ApiProperty({ type: UniversityStudentAcademicProgressDto, nullable: true })
  academicProgress: UniversityStudentAcademicProgressDto | null;

  @ApiProperty({ type: [ReminderDto] })
  reminders: ReminderDto[];

  @ApiProperty({ type: [ForumTopicDto] })
  latestForumTopics: ForumTopicDto[];

  @ApiProperty({ type: [EventDto] })
  upcomingEvents: EventDto[];
}

