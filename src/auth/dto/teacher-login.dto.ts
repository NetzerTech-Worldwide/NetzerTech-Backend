import { IsNotEmpty, IsString, MinLength , Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TeacherLoginDto {
  @ApiProperty({ description: 'Staff ID', example: 'TCH001' })
  @IsNotEmpty()
  @IsString()
  staffId: string;

  @ApiProperty({ description: 'Password', example: 'password123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).*$/, { message: 'Password must contain at least one letter and one number' })
  password: string;
}



