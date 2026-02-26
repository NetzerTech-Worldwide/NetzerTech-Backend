import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TeacherAdminLoginDto {
  @ApiProperty({ description: 'Email or username', example: 'teacher@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password', example: 'password123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
