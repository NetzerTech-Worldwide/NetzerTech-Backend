import { IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
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
  @MinLength(6)
  newPassword: string;

  @ApiPropertyOptional({ 
    description: 'Confirm new password (required for first-time login)', 
    example: 'newpassword123' 
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  confirmPassword?: string;
}
