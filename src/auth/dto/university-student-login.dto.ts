import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UniversityStudentLoginDto {
  @ApiProperty({ description: 'Matric number', example: 'MAT001' })
  @IsNotEmpty()
  @IsString()
  matricNumber: string;

  @ApiProperty({ description: 'Password', example: 'password123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
