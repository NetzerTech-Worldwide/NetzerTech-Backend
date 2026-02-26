import { IsNotEmpty, IsString, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterSubjectDto {
  @ApiProperty({ description: 'Session year', example: '2025/2026' })
  @IsNotEmpty()
  @IsString()
  sessionYear: string;

  @ApiProperty({ description: 'Term', example: 'First Term' })
  @IsNotEmpty()
  @IsString()
  term: string;

  @ApiProperty({ description: 'Class/Grade level', example: 'ss3' })
  @IsNotEmpty()
  @IsString()
  classLevel: string;

  @ApiProperty({
    type: [String],
    description: 'Array of subject names to register for',
    example: ['Mathematics', 'Biology', 'Physics', 'English'],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one subject is required' })
  @IsString({ each: true })
  subjects: string[];
}

export class RegistrationResultDto {
  @ApiProperty({ description: 'Registration ID', example: 'uuid' })
  registrationId: string;

  @ApiProperty({ description: 'Class title', example: 'Introduction to Algebra' })
  className: string;

  @ApiProperty({ description: 'Subject name', example: 'Mathematics' })
  subject: string;

  @ApiProperty({ description: 'Session year', example: '2024/2025' })
  sessionYear: string;

  @ApiProperty({ description: 'Term', example: 'First Term' })
  term: string;
}

export class RegisterSubjectResponseDto {
  @ApiProperty({ description: 'Success message', example: 'Subject registration successful' })
  message: string;

  @ApiProperty({ description: 'Number of subjects registered', example: 3 })
  registeredCount: number;

  @ApiProperty({ type: [RegistrationResultDto], description: 'List of successful registrations' })
  registrations: RegistrationResultDto[];

  @ApiProperty({ type: [String], description: 'List of skipped registrations (already registered)', nullable: true })
  skipped?: string[];
}
