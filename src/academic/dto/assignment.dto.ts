import { ApiProperty } from '@nestjs/swagger';
import { AssignmentPriority } from '../../entities/assignment.entity';
import { AssignmentStatus } from '../../entities/student-assignment.entity';

export class AssignmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  subject: string;

  @ApiProperty({ enum: AssignmentStatus })
  status: AssignmentStatus;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty({ nullable: true })
  description: string;

  @ApiProperty({ nullable: true })
  type: string;

  @ApiProperty()
  points: number;

  @ApiProperty({ enum: AssignmentPriority })
  priority: AssignmentPriority;
}

export enum AssignmentFilter {
  ALL = 'all',
  PENDING = 'pending',
  SUBMITTED = 'submitted',
}

export class AssignmentDetailDto extends AssignmentResponseDto {
  @ApiProperty({ nullable: true })
  submissionText: string | null;

  @ApiProperty({ nullable: true })
  submissionUrl: string | null;

  @ApiProperty({ nullable: true })
  grade: number | null;

  @ApiProperty({ nullable: true })
  feedback: string | null;

  @ApiProperty({ nullable: true })
  startedAt: Date | null;

  @ApiProperty({ nullable: true })
  submittedAt: Date | null;
}

export class StartAssignmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  status: AssignmentStatus;

  @ApiProperty()
  startedAt: Date;
}

export class SubmitAssignmentDto {
  @ApiProperty({ description: 'Text input for the assignment' })
  text: string;

  @ApiProperty({ description: 'Attachment URL (image, pdf, etc.)', required: false })
  attachmentUrl?: string;
}

export class SubmissionViewDto {
  @ApiProperty()
  assignmentId: string;

  @ApiProperty()
  assignmentTitle: string;

  @ApiProperty()
  status: AssignmentStatus;

  @ApiProperty({ nullable: true })
  submissionText: string | null;

  @ApiProperty({ nullable: true })
  submissionUrl: string | null;

  @ApiProperty({ nullable: true })
  submittedAt: Date | null;

  @ApiProperty({ nullable: true })
  grade: number | null;

  @ApiProperty({ nullable: true })
  feedback: string | null;
}


