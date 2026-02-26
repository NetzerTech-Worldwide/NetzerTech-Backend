import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ParentLoginDto {
  @ApiProperty({ description: 'Parent email', example: 'parent@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Student ID of the child', example: 'STU001' })
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @ApiProperty({ description: 'Password', example: 'password123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
