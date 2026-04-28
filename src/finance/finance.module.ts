import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { Bill } from '../entities/bill.entity';
import { BillItem } from '../entities/bill-item.entity';
import { StudentBill } from '../entities/student-bill.entity';
import { Payment } from '../entities/payment.entity';
import { Student } from '../entities/student.entity';
import { Class } from '../entities/class.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bill,
      BillItem,
      StudentBill,
      Payment,
      Student,
      Class,
    ]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
