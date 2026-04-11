import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsOptional, Min, Max } from 'class-validator';

export class SetReadingGoalDto {
    @ApiProperty({ description: 'The target number of books to read in the year', example: 20 })
    @IsNumber()
    @Min(1)
    targetBooks: number;
}

export class SetReminderDto {
    @ApiProperty({ description: 'Number of days before the due date to send a reminder (e.g. 1, 3, 7)', example: 3 })
    @IsNumber()
    @IsNotEmpty()
    daysBefore: number;
}

export class LibraryStatsDto {
    @ApiProperty({ example: 1 })
    currentlyBorrowed: number;

    @ApiProperty({ example: 0.00 })
    outstandingFines: number;

    @ApiProperty({ example: 1 })
    returnedBooks: number;

    @ApiProperty({ example: 20 })
    goalTarget: number;

    @ApiProperty({ example: 0 })
    goalRead: number;
}
