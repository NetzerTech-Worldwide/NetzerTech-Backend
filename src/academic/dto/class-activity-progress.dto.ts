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

  @ApiProperty({ description: 'Pre-formatted localized duration string', example: '45 mins' })
  duration: string;

  @ApiProperty({ enum: ClassActivityStatus })
  status: ClassActivityStatus;

  @ApiProperty({
    description: 'Map of question IDs to student answers (only populated when resuming an IN_PROGRESS attempt)',
    example: { 'q-uuid-1': 'Option A' },
    required: false
  })
  answers?: Record<string, string>;
}

export class QuestionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  @ApiProperty({ enum: QuestionType })
  type: QuestionType;

  @ApiProperty({ type: [Object], nullable: true, description: 'List of options as { label, text }' })
  options: any[];

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
    description: 'Map of question IDs to student answers (either string or object with label/option)',
    example: { 'q-uuid-1': 'Option A', 'q-uuid-2': { label: 'A', option: 'x = 2' } },
  })
  answers: Record<string, any>;
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

export class SaveClassActivityProgressDto {
  @ApiProperty({ description: 'The question ID being answered', example: 'uuid' })
  questionId: string;

  @ApiProperty({ description: 'The selected answer option', example: 'Option A' })
  answer: string;
}

export class ClassActivityResultAnalysisDto {
  @ApiProperty({ description: 'Total score achieved percentage', example: 85 })
  score: number;

  @ApiProperty({ description: 'Total number of questions in the activity', example: 50 })
  totalQuestions: number;

  @ApiProperty({ description: 'Number of correctly answered questions', example: 42 })
  correctAnswers: number;

  @ApiProperty({ description: 'Number of incorrectly answered questions', example: 5 })
  incorrectAnswers: number;

  @ApiProperty({ description: 'Number of skipped or unanswered questions', example: 3 })
  skippedAnswers: number;

  @ApiProperty({ description: 'Category performance percentages', example: { 'Problem Solving': 75, 'Application': 89 } })
  categoryPerformance: Record<string, number>;

  @ApiProperty({ description: 'Total time taken in seconds', example: 1534 })
  timeTakenSeconds: number;

  @ApiProperty({ description: 'Average time spent per question in seconds', example: 150 })
  timePerQuestionSeconds: number;
}

export class ClassActivityReviewItemDto {
  @ApiProperty({ description: 'The question ID' })
  questionId: string;

  @ApiProperty({ description: 'The question text' })
  text: string;

  @ApiProperty({ enum: QuestionType })
  type: QuestionType;

  @ApiProperty({ type: [Object], nullable: true, description: 'List of options as { label, text }' })
  options: any[];

  @ApiProperty({ description: 'The answer the student selected. Null if skipped.', nullable: true })
  studentAnswer: any | null;

  @ApiProperty({ description: 'The actual correct answer for the question' })
  correctAnswer: any;

  @ApiProperty({ description: 'Explanation or full working out for the question', nullable: true })
  solution: string | null;

  @ApiProperty({ description: 'Whether the student got this question right', example: true })
  isCorrect: boolean;
}

export class ClassActivityReviewResponseDto {
  @ApiProperty({ type: [ClassActivityReviewItemDto] })
  review: ClassActivityReviewItemDto[];

  @ApiProperty({ type: ClassActivityResultAnalysisDto })
  summary: ClassActivityResultAnalysisDto;
}
