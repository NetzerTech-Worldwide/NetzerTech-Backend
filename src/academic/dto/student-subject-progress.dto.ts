import { ApiProperty } from '@nestjs/swagger';

export class StudentSubjectProgressDto {
  @ApiProperty({ description: 'Subject name', example: 'Mathematics' })
  subject: string;

  @ApiProperty({ description: 'Grade/Score for this subject', example: 85, nullable: true })
  grade: number | null;

  @ApiProperty({ description: 'Progress percentage', example: 85.5, nullable: true })
  progress: number | null;

  @ApiProperty({ description: 'Session year', example: '2024/2025' })
  sessionYear: string;

  @ApiProperty({ description: 'Term', example: 'First Term' })
  term: string;

  @ApiProperty({ description: 'Registration date', example: '2024-01-15T00:00:00Z' })
  registeredAt: Date;

  @ApiProperty({ description: 'Number of classes for this subject', example: 3 })
  classCount: number;
}

export class StudentSubjectsProgressDto {
  @ApiProperty({ type: [StudentSubjectProgressDto], description: 'List of student subjects with progress' })
  subjects: StudentSubjectProgressDto[];

  @ApiProperty({ description: 'Total number of registered subjects', example: 5 })
  totalSubjects: number;
}

