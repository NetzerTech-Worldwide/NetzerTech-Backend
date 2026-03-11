import { IsNotEmpty, IsString, MinLength , Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token', example: 'abc123def456' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({ description: 'New password', example: 'newpassword123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).*$/, { message: 'Password must contain at least one letter and one number' })
  newPassword: string;

  @ApiProperty({ description: 'Confirm new password', example: 'newpassword123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).*$/, { message: 'Password must contain at least one letter and one number' })
  confirmPassword: string;
}
