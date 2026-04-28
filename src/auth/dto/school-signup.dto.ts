import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SchoolSignupDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  schoolName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  schoolSize: string;
}
