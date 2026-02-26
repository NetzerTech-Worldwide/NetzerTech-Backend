import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicController } from './academic.controller';
import { ExaminationController } from './examination.controller';
import { AcademicService } from './academic.service';
import {
  User,
  Student,
  Class,
  StudentClassRegistration,
  AcademicProgress,
  SubjectModule,
  LiveSession,
  Reminder,
  LiveSessionMessage,
  ClassActivity,
  Question,
  StudentClassActivity,
  LearningMaterial,
  LectureNote,
  LectureNoteSection,
  Assignment,
  StudentAssignment
} from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Student,
      Class,
      StudentClassRegistration,
      AcademicProgress,
      SubjectModule,
      LiveSession,
      Reminder,
      LiveSessionMessage,
      ClassActivity,
      Question,
      StudentClassActivity,
      LearningMaterial,
      LectureNote,
      LectureNoteSection,
      Assignment,
      StudentAssignment,
    ]),
  ],
  controllers: [AcademicController, ExaminationController],
  providers: [AcademicService],
  exports: [AcademicService],
})
export class AcademicModule { }
