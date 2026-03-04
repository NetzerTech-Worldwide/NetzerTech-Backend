import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimetableController } from './timetable.controller';
import { TimetableService } from './timetable.service';
import { User, Class, LiveSession } from '../entities';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Class, LiveSession]),
    ],
    controllers: [TimetableController],
    providers: [TimetableService],
    exports: [TimetableService],
})
export class TimetableModule { }
