import { ApiProperty } from '@nestjs/swagger';
import type { UserProfileDto } from './user-profile-response.dto';

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({
    description: 'Whether the user must change their password (true for first-time users)',
    example: false
  })
  mustChangePassword: boolean;

  @ApiProperty({
    description: 'User information'
  })
  user: UserProfileDto;

  @ApiProperty({
    description: 'Optional message (e.g., password change required)',
    required: false
  })
  message?: string;
}
