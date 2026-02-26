import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { CacheService } from '../common/services/cache.service';
import {
  User,
  Student,
  Teacher,
  Parent,
  Class,
  ClassActivity,
  Test,
  ForumTopic,
  Event,
  Attendance,
  Fee,
  Message,
  AcademicProgress,
  Reminder,
  ActivityLog,
} from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Student,
      Teacher,
      Parent,
      Class,
      ClassActivity,
      Test,
      ForumTopic,
      Event,
      Attendance,
      Fee,
      Message,
      AcademicProgress,
      Reminder,
      ActivityLog,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService, CacheService],
  exports: [DashboardService],
})
export class DashboardModule {}

