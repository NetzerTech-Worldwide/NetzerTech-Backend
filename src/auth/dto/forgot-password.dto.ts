import { IsEmail, IsNotEmpty , Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ 
    description: 'Email address for password reset', 
    example: 'user@example.com' 
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
