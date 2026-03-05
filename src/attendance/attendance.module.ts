import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { User, Student, Class, Attendance, LeaveRequest } from '../entities';

@Module({
    imports: [TypeOrmModule.forFeature([User, Student, Class, Attendance, LeaveRequest])],
    controllers: [AttendanceController],
    providers: [AttendanceService],
    exports: [AttendanceService],
})
export class AttendanceModule { }
