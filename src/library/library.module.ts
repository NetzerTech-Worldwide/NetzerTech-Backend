import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { 
    Book, 
    BookLoan, 
    BookReservation, 
    BookWishlist, 
    ReadingGoal 
} from '../entities/library.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Book, 
            BookLoan, 
            BookReservation, 
            BookWishlist, 
            ReadingGoal
        ]),
    ],
    controllers: [LibraryController],
    providers: [LibraryService],
    exports: [LibraryService],
})
export class LibraryModule {}
