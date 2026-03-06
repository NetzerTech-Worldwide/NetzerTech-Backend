import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { User, Student, Parent } from '../entities';
import { AttendanceModule } from '../attendance/attendance.module';
import { RecordsModule } from '../records/records.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Student, Parent]),
        AttendanceModule,
        RecordsModule
    ],
    controllers: [ProfileController],
    providers: [ProfileService],
})
export class ProfileModule { }
