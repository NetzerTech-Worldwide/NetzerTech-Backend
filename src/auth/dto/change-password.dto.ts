import { IsNotEmpty, IsString, MinLength, IsOptional , Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiPropertyOptional({ 
    description: 'Current password (required only if not first-time login)', 
    example: 'oldpassword123' 
  })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiProperty({ description: 'New password', example: 'newpassword123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).*$/, { message: 'Password must contain at least one letter and one number' })
  newPassword: string;

  @ApiPropertyOptional({ 
    description: 'Confirm new password (required for first-time login)', 
    example: 'newpassword123' 
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).*$/, { message: 'Password must contain at least one letter and one number' })
  confirmPassword?: string;
}
