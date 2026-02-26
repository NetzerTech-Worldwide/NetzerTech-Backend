import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ContactFormDto {
    @ApiProperty({ description: 'The full name of the sender', example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    fullName: string;

    @ApiProperty({ description: 'The email address to reply to', example: 'john@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'The subject of the inquiry', example: 'Pricing Inquiry' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    subject: string;

    @ApiProperty({ description: 'The full message content', example: 'I would like to learn more about the university tier features.' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    message: string;
}
