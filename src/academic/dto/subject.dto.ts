import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ description: 'Subject name', example: 'Mathematics' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Subject code', example: 'MTH101' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Duration', example: '24 Weeks' })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiProperty({ description: 'Teacher ID assigned', example: 'uuid' })
  @IsString()
  @IsOptional()
  teacherId?: string;
}

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


