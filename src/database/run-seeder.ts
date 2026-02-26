import { DataSource } from 'typeorm';
import { DatabaseSeeder } from './seeder';
import {
  User,
  Student,
  Parent,
  Teacher,
  Admin,
  PasswordResetToken,
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
  StudentClassRegistration,
  Question,
  StudentClassActivity,
  SubjectModule,
  LiveSession,
  LiveSessionMessage,
  LearningMaterial,
  LectureNote,
  LectureNoteSection,
  Assignment,
  StudentAssignment,
  BlacklistedToken,
  ActivityLog,
} from '../entities';
require('dotenv').config();

function getDataSourceConfig() {
  const dbUrl = process.env.DATABASE_URL || process.env.DB_URL;
  
  if (dbUrl) {
    const url = new URL(dbUrl);
    const dbName = url.pathname.slice(1); 
    
    return {
      type: 'postgres' as const,
      url: dbUrl,
      entities: [
        User,
        Student,
        Parent,
        Teacher,
        Admin,
        PasswordResetToken,
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
        StudentClassRegistration,
        Question,
        StudentClassActivity,
        SubjectModule,
        LiveSession,
        LiveSessionMessage,
        LearningMaterial,
        LectureNote,
        LectureNoteSection,
        Assignment,
        StudentAssignment,
        BlacklistedToken,
        ActivityLog,
      ],
      synchronize: true,
      ssl: dbUrl.includes('sslmode=require') || dbUrl.includes('ssl=true') 
        ? { rejectUnauthorized: false } 
        : false,
    };
  }
  
  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'netzertech',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    entities: [
    User,
    Student,
    Parent,
    Teacher,
    Admin,
    PasswordResetToken,
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
    StudentClassRegistration,
    Question,
    StudentClassActivity,
    SubjectModule,
    LiveSession,
    LiveSessionMessage,
    LearningMaterial,
    LectureNote,
    LectureNoteSection,
    Assignment,
    StudentAssignment,
    BlacklistedToken,
    ActivityLog,
    ],
    synchronize: true,
  };
}

const dataSource = new DataSource(getDataSourceConfig());

async function runSeeder() {
  try {
    await dataSource.initialize();
    console.log('Database connection established');
    
    const dbUrl = process.env.DATABASE_URL || process.env.DB_URL;
    if (dbUrl) {
      const url = new URL(dbUrl);
      console.log(`Connecting to: ${url.hostname}${url.pathname} (using connection string)`);
    } else {
      console.log(`Connecting to: ${process.env.DB_NAME || 'netzertech'} on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`);
    }

    const seeder = new DatabaseSeeder(dataSource);
    await seeder.seed();

    const userRepository = dataSource.getRepository(User);
    const userCount = await userRepository.count();
    console.log(`\n✓ Verification: ${userCount} user(s) found in database`);

    await dataSource.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error during seeding:', error);
    if (error.message) {
      console.error('Error details:', error.message);
    }
    process.exit(1);
  }
}

runSeeder();
