import { ApiProperty } from '@nestjs/swagger';
import { ClassActivityStatus } from '../../entities/student-class-activity.entity';
import { QuestionType } from '../../entities/question.entity';

export class StartClassActivityResponseDto {
  @ApiProperty()
  classActivityId: string;

  @ApiProperty()
  attemptId: string;

  @ApiProperty()
  startTime: Date;

  @ApiProperty({ enum: ClassActivityStatus })
  status: ClassActivityStatus;
}

export class QuestionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  @ApiProperty({ enum: QuestionType })
  type: QuestionType;

  @ApiProperty({ type: [String], nullable: true })
  options: string[];

  @ApiProperty()
  points: number;

  @ApiProperty()
  order: number;
}

export class ClassActivityQuestionsResponseDto {
  @ApiProperty({ type: [QuestionDto] })
  data: QuestionDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class ClassActivityDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  description: string;

  @ApiProperty({ nullable: true })
  instructions: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty()
  totalPoints: number;

  @ApiProperty({ nullable: true })
  timeLimit: number;

  @ApiProperty()
  teacherName: string;

  @ApiProperty({ enum: ClassActivityStatus, nullable: true })
  status?: ClassActivityStatus;
}

export class SubmitClassActivityDto {
  @ApiProperty({
    description: 'Map of question IDs to student answers',
    example: { 'q-uuid-1': 'Option A', 'q-uuid-2': 'True' },
  })
  answers: Record<string, string>;
}

export enum ClassActivityFilter {
  ALL = 'all',
  UPCOMING = 'upcoming',
  PAST = 'past',
}

export class ClassActivityResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  subject: string;

  @ApiProperty({ enum: ClassActivityStatus, nullable: true })
  status: ClassActivityStatus | null;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  totalPoints: number;

  @ApiProperty({ nullable: true })
  timeLimit: number | null;

  @ApiProperty({ nullable: true })
  score: number | null;
}
