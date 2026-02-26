import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TeacherLoginDto {
  @ApiProperty({ description: 'Staff ID', example: 'TCH001' })
  @IsNotEmpty()
  @IsString()
  staffId: string;

  @ApiProperty({ description: 'Password', example: 'password123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}



