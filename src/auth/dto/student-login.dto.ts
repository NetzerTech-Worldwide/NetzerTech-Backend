import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StudentLoginDto {
  @ApiProperty({ description: 'Student ID', example: 'STU001' })
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @ApiProperty({ description: 'Student full name', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Password', example: 'password123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
