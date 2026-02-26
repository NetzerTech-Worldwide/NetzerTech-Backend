import { ApiProperty } from '@nestjs/swagger';

export class ParentViewStudentProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  studentId: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ nullable: true })
  dateOfBirth: Date;

  @ApiProperty({ nullable: true })
  grade: string;

  @ApiProperty({ nullable: true })
  school: string;

  @ApiProperty({ nullable: true })
  gender: string;

  @ApiProperty({ nullable: true })
  profilePicture?: string;
}

export class AttendanceDto {
  @ApiProperty()
  totalDays: number;

  @ApiProperty()
  presentDays: number;

  @ApiProperty()
  absentDays: number;

  @ApiProperty()
  lateDays: number;

  @ApiProperty()
  attendancePercentage: number;
}

export class FeeSummaryDto {
  @ApiProperty()
  totalFee: number;

  @ApiProperty()
  paidFee: number;

  @ApiProperty()
  pendingFee: number;

  @ApiProperty()
  overdueFee: number;
}

export class PaymentSummaryDto {
  @ApiProperty({ type: [Object] })
  recentPayments: Array<{
    id: string;
    title: string;
    amount: number;
    status: string;
    paidDate: Date | null;
    dueDate: Date;
  }>;

  @ApiProperty({ type: FeeSummaryDto })
  summary: FeeSummaryDto;
}

export class ParentDashboardDto {
  @ApiProperty({ type: ParentViewStudentProfileDto })
  studentProfile: ParentViewStudentProfileDto;

  @ApiProperty({ type: AttendanceDto })
  attendance: AttendanceDto;

  @ApiProperty()
  totalFee: number;

  @ApiProperty()
  unreadMessages: number;

  @ApiProperty({ type: PaymentSummaryDto })
  paymentSummary: PaymentSummaryDto;
}

