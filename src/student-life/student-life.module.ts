import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubController } from './club.controller';
import { ClubService } from './club.service';
import { User, Student, Club, StudentClub, ClubEvent, StudentClubEvent, ClubAnnouncement } from '../entities';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Student,
            Club,
            StudentClub,
            ClubEvent,
            StudentClubEvent,
            ClubAnnouncement
        ])
    ],
    controllers: [ClubController],
    providers: [ClubService],
    exports: [ClubService]
})
export class StudentLifeModule { }
