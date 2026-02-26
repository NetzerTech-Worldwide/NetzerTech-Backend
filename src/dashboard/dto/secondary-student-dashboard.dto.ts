import { ApiProperty } from '@nestjs/swagger';

export class SecondaryStudentProfileDto {
  @ApiProperty({ description: 'Student full name' })
  fullName: string;

  @ApiProperty({ description: 'Student ID' })
  studentId: string;

  @ApiProperty({ description: 'Grade/Class', nullable: true })
  grade?: string;

  @ApiProperty({ description: 'School name', nullable: true })
  school?: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Profile picture URL', nullable: true })
  profilePicture?: string;
}

export class NextClassDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty({ nullable: true })
  location: string;
}

export class ClassActivityDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty()
  totalPoints: number;
}

export class UpcomingTestDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  testDate: Date;

  @ApiProperty()
  totalPoints: number;
}

export class AcademicProgressDto {
  @ApiProperty({ nullable: true })
  gpa: number;

  @ApiProperty({ nullable: true })
  grades: Record<string, number>;

  @ApiProperty()
  totalCredits: number;

  @ApiProperty()
  completedCredits: number;

  @ApiProperty({ description: 'Academic progress percentage' })
  progressPercentage: number;
}

export class ReminderDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  description: string;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty()
  isImportant: boolean;

  @ApiProperty({ nullable: true })
  type: string;

  @ApiProperty()
  status: string;
}

export class ForumTopicDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  views: number;

  @ApiProperty()
  replies: number;

  @ApiProperty()
  createdAt: Date;
}

export class EventDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  description: string;

  @ApiProperty()
  eventDate: Date;

  @ApiProperty({ nullable: true })
  location: string;

  @ApiProperty({ nullable: true })
  image: string;
}

export class SecondaryStudentDashboardDto {
  @ApiProperty({ type: SecondaryStudentProfileDto, description: 'Student profile information' })
  profile: SecondaryStudentProfileDto;

  @ApiProperty({ type: NextClassDto, nullable: true })
  nextClass: NextClassDto | null;

  @ApiProperty({ type: [ClassActivityDto] })
  classActivities: ClassActivityDto[];

  @ApiProperty({ type: [UpcomingTestDto] })
  upcomingTests: UpcomingTestDto[];

  @ApiProperty({ type: AcademicProgressDto, nullable: true })
  academicProgress: AcademicProgressDto | null;

  @ApiProperty({ type: [ReminderDto] })
  reminders: ReminderDto[];

  @ApiProperty({ type: [ForumTopicDto] })
  latestForumTopics: ForumTopicDto[];

  @ApiProperty({ type: [EventDto] })
  upcomingEvents: EventDto[];
}

