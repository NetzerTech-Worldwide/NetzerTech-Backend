import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AcademicModule } from './academic/academic.module';
import { MailModule } from './mail/mail.module';
import { ContactModule } from './contact/contact.module';
import {
  User,
  Student,
  Parent,
  Teacher,
  Admin,
  PasswordResetToken,
  BlacklistedToken,
  Class,
  ClassActivity,
  StudentClassActivity,
  Question,
  SubjectModule,
  LiveSession,
  LiveSessionMessage,
  StudentClassRegistration,
  LearningMaterial,
  LectureNote,
  LectureNoteSection,
  Assignment,
  StudentAssignment,
  Test,
  ForumTopic,
  Event,
  Attendance,
  Fee,
  Message,
  AcademicProgress,
  Reminder,
  ActivityLog,
} from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          // First limit: 10 requests per 1 minute (burst protection)
          ttl: configService.get<number>('THROTTLE_BURST_TTL', 60000), // 1 minute in milliseconds
          limit: configService.get<number>('THROTTLE_BURST_LIMIT', 10), // 10 requests per minute
        },
        {
          // Second limit: After exceeding burst, block for 30 minutes (cooldown period)
          ttl: configService.get<number>('THROTTLE_COOLDOWN_TTL', 1800000), // 30 minutes in milliseconds
          limit: configService.get<number>('THROTTLE_COOLDOWN_LIMIT', 10), // Same limit to enforce cooldown
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Support both connection string URL and individual parameters
        const dbUrl = configService.get<string>('DATABASE_URL') || configService.get<string>('DB_URL');

        const commonConfig = {
          entities: [
            User,
            Student,
            Parent,
            Teacher,
            Admin,
            PasswordResetToken,
            BlacklistedToken,
            Class,
            ClassActivity,
            StudentClassActivity,
            Question,
            SubjectModule,
            LiveSession,
            LiveSessionMessage,
            StudentClassRegistration,
            LearningMaterial,
            LectureNote,
            LectureNoteSection,
            Assignment,
            StudentAssignment,
            Test,
            ForumTopic,
            Event,
            Attendance,
            Fee,
            Message,
            AcademicProgress,
            Reminder,
            ActivityLog,
          ],
          synchronize: configService.get('NODE_ENV') === 'development',
          logging: configService.get('NODE_ENV') === 'development',
          retryAttempts: 5,
          retryDelay: 3000,
          autoLoadEntities: true,
        };

        // If connection string is provided, use it (preferred for Supabase)
        if (dbUrl) {
          // If using Supabase Connection Pooler (port 6543), pgbouncer=true must be appended or passed
          const isSupabasePooler = dbUrl.includes('supabase.com:6543') || dbUrl.includes('supabase.co:6543');

          return {
            type: 'postgres',
            url: dbUrl,
            ssl: configService.get('DB_SSL') !== 'false' ? {
              rejectUnauthorized: false, // Required for Supabase
            } : false,
            // Required for Supabase pgBouncer/Supavisor Transaction Mode to prevent "Circuit breaker open" errors
            extra: isSupabasePooler ? {
              pgbouncer: true,
            } : {},
            ...commonConfig,
          };
        }

        // Otherwise, use individual parameters
        const dbHost = configService.get('DB_HOST', 'localhost');
        const dbPort = configService.get('DB_PORT', 5432);
        const dbUsername = configService.get('DB_USERNAME', 'postgres');
        const dbPassword = configService.get('DB_PASSWORD', 'password');
        const dbName = configService.get('DB_NAME', 'netzertech');
        const isSupabase = dbHost.includes('supabase.co');

        return {
          type: 'postgres',
          host: dbHost,
          port: parseInt(dbPort.toString(), 10),
          username: dbUsername,
          password: dbPassword,
          database: dbName,
          // SSL configuration for Supabase
          ssl: isSupabase ? {
            rejectUnauthorized: false,
          } : false,
          // Force IPv4 for Supabase connections (fixes ENETUNREACH error)
          extra: isSupabase ? {
            options: '--connect_timeout=10',
          } : {},
          ...commonConfig,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    DashboardModule,
    AcademicModule,
    MailModule,
    ContactModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
