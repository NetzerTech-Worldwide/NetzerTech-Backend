import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { 
    Book, 
    BookLoan, 
    BookReservation, 
    BookWishlist, 
    ReadingGoal,
    LoanStatus
} from '../entities/library.entity';
import { SetReadingGoalDto, LibraryStatsDto } from './dto/library.dto';

@Injectable()
export class LibraryService {
    constructor(
        @InjectRepository(Book)
        private bookRepository: Repository<Book>,
        @InjectRepository(BookLoan)
        private loanRepository: Repository<BookLoan>,
        @InjectRepository(BookReservation)
        private reservationRepository: Repository<BookReservation>,
        @InjectRepository(BookWishlist)
        private wishlistRepository: Repository<BookWishlist>,
        @InjectRepository(ReadingGoal)
        private goalRepository: Repository<ReadingGoal>,
    ) {}

    // --- Stats ---
    async getStats(studentId: string): Promise<LibraryStatsDto> {
        const activeLoans = await this.loanRepository.count({
            where: { studentId, status: LoanStatus.ACTIVE }
        });

        // Calculate dynamic fines
        const now = new Date();
        let outstandingFines = 0;
        
        // Fines come from both active overdue loans and returned loans with unpaid fines
        const loansWithPotentialFines = await this.loanRepository.find({
            where: { studentId },
            relations: ['book']
        });

        for (const loan of loansWithPotentialFines) {
            if (loan.status === LoanStatus.RETURNED) {
                outstandingFines += Number(loan.fineAmount);
            } else if (now > loan.dueDate) {
                // Determine active overdue fine manually
                const diffTime = Math.abs(now.getTime() - loan.dueDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                outstandingFines += diffDays * Number(loan.book.lateFineRate);
            }
        }

        const returnedBooks = await this.loanRepository.count({
            where: { studentId, status: LoanStatus.RETURNED }
        });

        const currentYear = new Date().getFullYear();
        let goal = await this.goalRepository.findOne({
            where: { studentId, year: currentYear }
        });

        return {
            currentlyBorrowed: activeLoans,
            outstandingFines,
            returnedBooks,
            goalTarget: goal ? goal.targetBooks : 20,
            goalRead: goal ? goal.booksRead : returnedBooks // Default to returned items if not explicitly tracked
        };
    }

    // --- Book Catalog ---
    async getCatalog(search?: string, category?: string, status?: string): Promise<Book[]> {
        const query = this.bookRepository.createQueryBuilder('book')
            .where('book.isActive = :isActive', { isActive: true });

        if (search) {
            query.andWhere(
                '(LOWER(book.title) LIKE LOWER(:search) OR LOWER(book.author) LIKE LOWER(:search) OR LOWER(book.isbn) LIKE LOWER(:search))',
                { search: `%${search}%` }
            );
        }

        if (category && category !== 'All') {
            query.andWhere('book.category = :category', { category });
        }

        if (status === 'Available') {
            query.andWhere('book.availableCopies > 0');
        } else if (status === 'Unavailable') {
            query.andWhere('book.availableCopies <= 0');
        }

        return query.orderBy('book.title', 'ASC').getMany();
    }

    // --- Borrowing Operations ---
    async borrowBook(studentId: string, bookId: string): Promise<BookLoan> {
        // 1. Check if user already has it active
        const existingLoan = await this.loanRepository.findOne({
            where: { studentId, bookId, status: LoanStatus.ACTIVE }
        });
        if (existingLoan) {
            throw new BadRequestException('You have already borrowed this book.');
        }

        // 2. Fetch book
        const book = await this.bookRepository.findOne({ where: { id: bookId } });
        if (!book) throw new NotFoundException('Book not found');

        // 3. Check exact availability (use transaction in prod, simplified here)
        if (book.availableCopies <= 0) {
            throw new BadRequestException('Book is currently unavailable. Please reserve it.');
        }

        // 4. Update copies
        book.availableCopies -= 1;
        await this.bookRepository.save(book);

        // 5. Create Loan (default 7 days due date)
        const borrowDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);

        const loan = this.loanRepository.create({
            bookId,
            studentId,
            borrowDate,
            dueDate,
            status: LoanStatus.ACTIVE
        });

        return this.loanRepository.save(loan);
    }

    async returnBook(studentId: string, loanId: string): Promise<BookLoan> {
        const loan = await this.loanRepository.findOne({
            where: { id: loanId, studentId },
            relations: ['book']
        });

        if (!loan) throw new NotFoundException('Active loan not found');
        if (loan.status === LoanStatus.RETURNED) throw new BadRequestException('Book already returned');

        // Increment copies
        loan.book.availableCopies += 1;
        await this.bookRepository.save(loan.book);

        // Update Loan
        const now = new Date();
        loan.status = LoanStatus.RETURNED;
        loan.returnDate = now;

        // Finalize Fines if overdue
        if (now > loan.dueDate) {
            const diffTime = Math.abs(now.getTime() - loan.dueDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            loan.fineAmount = diffDays * Number(loan.book.lateFineRate);
        }
        
        // Update reading goal
        const currentYear = new Date().getFullYear();
        let goal = await this.goalRepository.findOne({ where: { studentId, year: currentYear } });
        if (goal) {
            goal.booksRead += 1;
            await this.goalRepository.save(goal);
        }

        return this.loanRepository.save(loan);
    }

    async renewBook(studentId: string, loanId: string): Promise<BookLoan> {
        const loan = await this.loanRepository.findOne({
            where: { id: loanId, studentId, status: LoanStatus.ACTIVE }
        });

        if (!loan) throw new NotFoundException('Active loan not found');
        
        // Add 7 days to current due date
        loan.dueDate.setDate(loan.dueDate.getDate() + 7);
        return this.loanRepository.save(loan);
    }

    async setReminder(studentId: string, loanId: string, daysBefore: number): Promise<BookLoan> {
        const loan = await this.loanRepository.findOne({
            where: { id: loanId, studentId, status: LoanStatus.ACTIVE }
        });

        if (!loan) throw new NotFoundException('Active loan not found');
        
        loan.reminderSentDaysBefore = daysBefore;
        return this.loanRepository.save(loan);
    }

    // --- Lists ---
    async getBorrowedBooks(studentId: string): Promise<BookLoan[]> {
        return this.loanRepository.find({
            where: { studentId, status: LoanStatus.ACTIVE },
            relations: ['book'],
            order: { borrowDate: 'DESC' }
        });
    }

    async getBorrowHistory(studentId: string, status?: string): Promise<BookLoan[]> {
        const query = this.loanRepository.createQueryBuilder('loan')
            .leftJoinAndSelect('loan.book', 'book')
            .where('loan.studentId = :studentId', { studentId });

        if (status && status !== 'All') {
            query.andWhere('loan.status = :status', { status });
        }

        return query.orderBy('loan.borrowDate', 'DESC').getMany();
    }

    async rateLoan(studentId: string, loanId: string, rating: number): Promise<BookLoan> {
        let loan = await this.loanRepository.findOne({
            where: { id: loanId, studentId, status: LoanStatus.RETURNED },
            relations: ['book']
        });

        if (!loan) throw new NotFoundException('Returned loan not found');
        if (rating < 1 || rating > 5) throw new BadRequestException('Rating must be between 1 and 5');

        loan.userRating = rating;
        loan = await this.loanRepository.save(loan);

        // Optionally update the book's overall rating here based on all its loans
        // For now, we just save the student's rating on the loan record.

        return loan;
    }

    // --- Wishlist ---
    async getWishlist(studentId: string): Promise<BookWishlist[]> {
        return this.wishlistRepository.find({
            where: { studentId },
            relations: ['book'],
            order: { createdAt: 'DESC' }
        });
    }

    async toggleWishlist(studentId: string, bookId: string): Promise<{ message: string, added: boolean }> {
        const existing = await this.wishlistRepository.findOne({
            where: { studentId, bookId }
        });

        if (existing) {
            await this.wishlistRepository.remove(existing);
            return { message: 'Removed from wishlist', added: false };
        } else {
            const wishlist = this.wishlistRepository.create({ studentId, bookId });
            await this.wishlistRepository.save(wishlist);
            return { message: 'Added to wishlist', added: true };
        }
    }

    // --- Reservations ---
    async getReservations(studentId: string): Promise<any[]> {
        const reservations = await this.reservationRepository.find({
            where: { studentId },
            relations: ['book'],
            order: { createdAt: 'ASC' } 
        });

        const result = [];
        for (const res of reservations) {
            // Find queue position
            const queue = await this.reservationRepository.find({
                where: { bookId: res.bookId, status: 'Pending' },
                order: { createdAt: 'ASC' }
            });

            const queuePosition = queue.findIndex(q => q.id === res.id) + 1;

            // Find estimated date (look at earliest due date of active loans)
            const activeLoans = await this.loanRepository.find({
                where: { bookId: res.bookId, status: LoanStatus.ACTIVE },
                order: { dueDate: 'ASC' }
            });

            let estAvailableDate = null;
            if (activeLoans.length > 0) {
                // Base it off the earliest due date, plus queue position padding
                const baseDate = new Date(activeLoans[0].dueDate);
                baseDate.setDate(baseDate.getDate() + (queuePosition - 1) * 7);
                estAvailableDate = baseDate;
            }

            result.push({
                ...res,
                queuePosition: queuePosition > 0 ? `#${queuePosition} in line` : 'Ready',
                estAvailableDate
            });
        }

        // Return latest first for the UI view
        return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    async reserveBook(studentId: string, bookId: string): Promise<BookReservation> {
        const book = await this.bookRepository.findOne({ where: { id: bookId } });
        if (!book) throw new NotFoundException('Book not found');

        const existing = await this.reservationRepository.findOne({
            where: { studentId, bookId, status: 'Pending' }
        });

        if (existing) throw new BadRequestException('You already have a pending reservation for this book');

        const reservation = this.reservationRepository.create({
            studentId,
            bookId,
            status: 'Pending'
        });

        return this.reservationRepository.save(reservation);
    }

    // --- Goals ---
    async setReadingGoal(studentId: string, dto: SetReadingGoalDto): Promise<ReadingGoal> {
        const currentYear = new Date().getFullYear();
        let goal = await this.goalRepository.findOne({
            where: { studentId, year: currentYear }
        });

        if (goal) {
            goal.targetBooks = dto.targetBooks;
        } else {
            goal = this.goalRepository.create({
                studentId,
                year: currentYear,
                targetBooks: dto.targetBooks,
                booksRead: 0
            });
        }

        return this.goalRepository.save(goal);
    }

    // --- Fines ---
    async getActiveFines(studentId: string): Promise<any[]> {
        const now = new Date();
        const activeLoans = await this.loanRepository.find({
            where: { studentId, status: LoanStatus.ACTIVE },
            relations: ['book']
        });

        const overdueLoans = activeLoans.filter(loan => now > loan.dueDate);
        
        return overdueLoans.map(loan => {
            const diffTime = Math.abs(now.getTime() - loan.dueDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            const dynamicFine = diffDays * Number(loan.book.lateFineRate);

            return {
                ...loan,
                daysOverdue: diffDays,
                dynamicFineAmount: dynamicFine
            };
        });
    }

    async getFineHistory(studentId: string): Promise<BookLoan[]> {
        // Return returned loans that incurred a fine
        return this.loanRepository.createQueryBuilder('loan')
            .leftJoinAndSelect('loan.book', 'book')
            .where('loan.studentId = :studentId', { studentId })
            .andWhere('loan.status = :status', { status: LoanStatus.RETURNED })
            .andWhere('loan.fineAmount > 0')
            .orderBy('loan.returnDate', 'DESC')
            .getMany();
    }
}
