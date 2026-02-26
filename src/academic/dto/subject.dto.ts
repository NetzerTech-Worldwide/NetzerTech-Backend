import { ApiProperty } from '@nestjs/swagger';

export class SubjectDto {
  @ApiProperty({ description: 'Subject name', example: 'Mathematics' })
  name: string;

  @ApiProperty({ description: 'Name of the teacher for this subject', example: 'Mr. Smith' })
  teacherName: string;

  @ApiProperty({ description: 'Whether the student has registered for this subject', example: true })
  isRegistered: boolean;
}

export class AvailableSubjectsDto {
  @ApiProperty({ type: [SubjectDto], description: 'List of all available subjects with registration status' })
  subjects: SubjectDto[];
}


