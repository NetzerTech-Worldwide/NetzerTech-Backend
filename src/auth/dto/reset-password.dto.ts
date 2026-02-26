import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token', example: 'abc123def456' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({ description: 'New password', example: 'newpassword123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({ description: 'Confirm new password', example: 'newpassword123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  confirmPassword: string;
}
