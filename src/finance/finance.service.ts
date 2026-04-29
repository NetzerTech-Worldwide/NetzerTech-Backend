import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill, BillStatus } from '../entities/bill.entity';
import { BillItem } from '../entities/bill-item.entity';
import { StudentBill, StudentBillStatus } from '../entities/student-bill.entity';
import { Payment } from '../entities/payment.entity';
import { Student } from '../entities/student.entity';
import { Class } from '../entities/class.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepo: Repository<Bill>,
    @InjectRepository(BillItem)
    private readonly billItemRepo: Repository<BillItem>,
    @InjectRepository(StudentBill)
    private readonly studentBillRepo: Repository<StudentBill>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Class)
    private readonly classRepo: Repository<Class>,
  ) {}

  async getBills(session?: string, term?: string) {
    const query = this.billRepo.createQueryBuilder('bill')
      .leftJoinAndSelect('bill.items', 'items')
      .leftJoinAndSelect('bill.studentBills', 'studentBills');

    if (session) {
      query.andWhere('bill.session = :session', { session });
    }
    if (term) {
      query.andWhere('bill.term = :term', { term });
    }

    const bills = await query.getMany();

    return bills.map(bill => {
      const total = bill.items.reduce((sum, item) => sum + Number(item.amount), 0);
      const computedVAT = Math.round(total * (Number(bill.vatPercent) / 100));
      const grandTotal = total + Number(bill.bankCharges) + computedVAT;

      return {
        id: bill.id,
        title: bill.title,
        session: bill.session,
        term: bill.term,
        targetClass: bill.targetClass,
        targetType: bill.targetType,
        isUniversal: bill.isUniversal,
        items: bill.items,
        total,
        bankCharges: Number(bill.bankCharges),
        vat: computedVAT,
        grandTotal,
        status: bill.status,
        createdDate: bill.createdAt,
        publishedDate: bill.publishedDate,
        studentsCount: bill.studentBills.length,
        paidCount: bill.studentBills.filter(sb => sb.status === StudentBillStatus.PAID).length,
        partialCount: bill.studentBills.filter(sb => sb.status === StudentBillStatus.PARTIAL).length,
      };
    });
  }

  async createBill(data: any) {
    const newBill = this.billRepo.create({
      title: data.title,
      session: data.session,
      term: data.term,
      targetClass: data.targetClass,
      targetType: data.targetType,
      isUniversal: data.isUniversal,
      bankCharges: data.bankCharges || 0,
      vatPercent: data.vatPercent || 0,
      status: BillStatus.DRAFT,
    });

    const savedBill = await this.billRepo.save(newBill);

    if (data.items && data.items.length > 0) {
      const items = data.items.map(item => this.billItemRepo.create({
        name: item.name,
        amount: item.amount,
        bill: savedBill,
      }));
      await this.billItemRepo.save(items);
    }

    // Attach to students
    let students: Student[] = [];
    if (data.targetType === 'student') {
      if (data.isUniversal) {
        students = await this.studentRepo.find();
      } else if (data.targetClass) {
        const targetClass = await this.classRepo.findOne({
          where: { title: data.targetClass },
          relations: ['students'],
        });
        if (targetClass) {
          students = targetClass.students;
        }
      }

      if (students.length > 0) {
        const studentBills = students.map(student => this.studentBillRepo.create({
          student,
          bill: savedBill,
          amountPaid: 0,
          status: StudentBillStatus.UNPAID,
        }));
        await this.studentBillRepo.save(studentBills);
      }
    }

    return this.getBills();
  }

  async publishBill(id: string) {
    const bill = await this.billRepo.findOne({ where: { id } });
    if (!bill) throw new NotFoundException('Bill not found');

    bill.status = BillStatus.PUBLISHED;
    bill.publishedDate = new Date();
    await this.billRepo.save(bill);

    return { message: 'Bill published successfully' };
  }

  async getPayments() {
    const studentBills = await this.studentBillRepo.find({
      relations: ['student', 'bill', 'bill.items', 'payments'],
    });

    const formattedPayments: any[] = [];

    for (const sb of studentBills) {
      const total = sb.bill.items.reduce((sum, item) => sum + Number(item.amount), 0);
      const computedVAT = Math.round(total * (Number(sb.bill.vatPercent) / 100));
      const grandTotal = total + Number(sb.bill.bankCharges) + computedVAT;
      const balance = grandTotal - Number(sb.amountPaid);

      // We add a single summarized row per student bill for the main list
      // Or we can list actual payments. The frontend expects `paymentRecords` to have balance.
      // Looking at the frontend, it wants one record per payment OR one per student-bill.
      // Frontend expects `student`, `class`, `billTitle`, `amountPaid`, `billTotal`, `balance`, `status`.
      // Actually, frontend lists payment history per student-bill. If there are multiple payments, it might list the latest or aggregate.
      // Let's create an aggregate record per student-bill if amountPaid > 0, OR just return all studentBills as payment records.
      
      const lastPayment = sb.payments.length > 0 ? sb.payments[sb.payments.length - 1] : null;

      formattedPayments.push({
        id: sb.id, // studentBill ID
        student: sb.student.fullName,
        class: sb.bill.targetClass,
        billTitle: sb.bill.title,
        amountPaid: Number(sb.amountPaid),
        billTotal: grandTotal,
        balance: balance,
        status: sb.status,
        date: lastPayment ? lastPayment.date.toISOString().split('T')[0] : 'N/A',
        method: lastPayment ? lastPayment.method : 'N/A',
        reference: lastPayment ? lastPayment.reference : 'N/A',
        breakdown: sb.bill.items.map(item => ({ component: item.name, amount: Number(item.amount) })),
      });
    }

    return formattedPayments;
  }

  async recordPayment(data: any) {
    // Find the student bill by billId and student name/class (or just ID if we pass it)
    // The frontend sends `billTitle` and `studentName`.
    // Let's assume frontend will pass `studentBillId` or we find it.
    let studentBill;
    if (data.studentBillId) {
      studentBill = await this.studentBillRepo.findOne({ where: { id: data.studentBillId }, relations: ['bill', 'bill.items'] });
    } else {
      // Find by student name and bill title
      studentBill = await this.studentBillRepo.findOne({
        where: {
          student: { fullName: data.studentName },
          bill: { title: data.billTitle }
        },
        relations: ['student', 'bill', 'bill.items']
      });
    }

    if (!studentBill) throw new NotFoundException('Student bill not found');

    const payment = this.paymentRepo.create({
      studentBill,
      amount: data.amount,
      method: data.method,
      reference: data.reference || `REF-${Math.floor(Math.random() * 1000000)}`,
      date: data.date ? new Date(data.date) : new Date(),
    });

    await this.paymentRepo.save(payment);

    // Update student bill
    studentBill.amountPaid = Number(studentBill.amountPaid) + Number(data.amount);

    const total = studentBill.bill.items.reduce((sum, item) => sum + Number(item.amount), 0);
    const computedVAT = Math.round(total * (Number(studentBill.bill.vatPercent) / 100));
    const grandTotal = total + Number(studentBill.bill.bankCharges) + computedVAT;

    if (studentBill.amountPaid >= grandTotal) {
      studentBill.status = StudentBillStatus.PAID;
    } else if (studentBill.amountPaid > 0) {
      studentBill.status = StudentBillStatus.PARTIAL;
    }

    await this.studentBillRepo.save(studentBill);

    return this.getPayments();
  }

  async getRevenue() {
    // Aggregate payments by month and breakdown by source
    const payments = await this.paymentRepo.find({ relations: ['studentBill', 'studentBill.bill', 'studentBill.bill.items'] });

    // Monthly revenue logic
    // Just a basic implementation for now
    const monthlyRevenue = [];
    const revenueBreakdown = [];

    // ... populate real logic here based on your actual data

    return {
      monthlyRevenue,
      revenueBreakdown,
    };
  }
}
