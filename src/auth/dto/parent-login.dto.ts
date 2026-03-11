import { IsNotEmpty, IsString, MinLength, IsEmail, Matches } from 'class-validator';
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
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).*$/, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;
}
