import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, Student, Parent, Teacher, Admin } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Student, Parent, Teacher, Admin])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
