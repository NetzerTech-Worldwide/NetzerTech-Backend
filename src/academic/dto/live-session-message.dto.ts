import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendLiveSessionMessageDto {
  @ApiProperty({ description: 'Message content' })
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class LiveSessionMessageDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  senderId: string;

  @ApiProperty()
  senderName: string;

  @ApiProperty({ nullable: true })
  senderProfilePicture: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  isMe: boolean;
}
