import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { User, StudentClassActivity, StudentAssignment, Attendance } from '../entities';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            StudentClassActivity,
            StudentAssignment,
            Attendance
        ]),
    ],
    controllers: [RecordsController],
    providers: [RecordsService],
    exports: [RecordsService],
})
export class RecordsModule { }
