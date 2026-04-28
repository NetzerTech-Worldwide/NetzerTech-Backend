import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('admin/finance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('bills')
  async getBills(
    @Query('session') session?: string,
    @Query('term') term?: string,
  ) {
    return this.financeService.getBills(session, term);
  }

  @Post('bills')
  async createBill(@Body() createBillDto: any) {
    return this.financeService.createBill(createBillDto);
  }

  @Patch('bills/:id/publish')
  async publishBill(@Param('id') id: string) {
    return this.financeService.publishBill(id);
  }

  @Get('payments')
  async getPayments() {
    return this.financeService.getPayments();
  }

  @Post('payments')
  async recordPayment(@Body() createPaymentDto: any) {
    return this.financeService.recordPayment(createPaymentDto);
  }

  @Get('revenue')
  async getRevenue() {
    return this.financeService.getRevenue();
  }
}
