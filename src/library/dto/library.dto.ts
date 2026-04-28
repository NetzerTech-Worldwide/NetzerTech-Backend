import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsOptional, Min, Max, IsString } from 'class-validator';

export class CreateBookDto {
    @ApiProperty({ description: 'Title of the book', example: 'Clean Code' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'Author of the book', example: 'Robert C. Martin' })
    @IsString()
    @IsNotEmpty()
    author: string;

    @ApiProperty({ description: 'ISBN number', example: '9780132350884' })
    @IsString()
    @IsNotEmpty()
    isbn: string;

    @ApiProperty({ description: 'Category', example: 'Technology' })
    @IsString()
    @IsNotEmpty()
    category: string;

    @ApiProperty({ description: 'Number of copies available', example: 5 })
    @IsNumber()
    @Min(1)
    copies: number;

    @ApiPropertyOptional({ description: 'Location on the shelf', example: 'A1-Tech' })
    @IsString()
    @IsOptional()
    shelfLocation?: string;

    @ApiPropertyOptional({ description: 'Publisher', example: 'Prentice Hall' })
    @IsString()
    @IsOptional()
    publisher?: string;

    @ApiPropertyOptional({ description: 'Year published', example: '2008' })
    @IsString()
    @IsOptional()
    yearPublished?: string;
}

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

export class RateBookDto {
    @ApiProperty({ description: 'Rating from 1 to 5', example: 5 })
    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;
}
