import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class ContactFormDto {
    @ApiProperty({ description: 'The first name of the sender', example: 'John' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    firstName: string;

    @ApiProperty({ description: 'The last name of the sender', example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    lastName: string;

    @ApiProperty({ description: 'The email address to reply to', example: 'john@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'The phone number of the sender', example: '+1234567890' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    phoneNumber: string;

    @ApiProperty({ description: 'The full message content', example: 'I would like to learn more about the university tier features.' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    message: string;
}
