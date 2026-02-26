import { ApiProperty } from '@nestjs/swagger';

export class TodayClassDto {
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

  @ApiProperty()
  studentCount: number;
}

export class ActiveStudentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  studentId: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ nullable: true })
  grade: string;

  @ApiProperty({ nullable: true })
  profilePicture?: string;
}

export class PendingGradeDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty()
  pendingCount: number;
}

export class RecentActivityDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdAt: Date;
}

export class StudentsByGenderDto {
  @ApiProperty()
  boys: number;

  @ApiProperty()
  girls: number;
}

export class TeacherDashboardDto {
  @ApiProperty({ type: [TodayClassDto] })
  todayClasses: TodayClassDto[];

  @ApiProperty({ type: [ActiveStudentDto] })
  activeStudents: ActiveStudentDto[];

  @ApiProperty({ type: [PendingGradeDto] })
  pendingGrades: PendingGradeDto[];

  @ApiProperty({ type: [RecentActivityDto] })
  recentActivities: RecentActivityDto[];

  @ApiProperty({ type: StudentsByGenderDto })
  studentsByGender: StudentsByGenderDto;
}

