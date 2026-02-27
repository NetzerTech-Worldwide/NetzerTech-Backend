import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class ContactFormDto {
    @ApiProperty({ description: 'The category or reason for contacting', example: 'For School' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    category: string;

    @ApiProperty({ description: 'The full name of the sender', example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    fullName: string;

    @ApiProperty({ description: 'The email address to reply to', example: 'john@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'The name of the school (optional)', example: 'Springfield High', required: false })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    schoolName?: string;

    @ApiProperty({ description: 'The full message content', example: 'I would like to learn more about the university tier features.' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    message: string;
}
