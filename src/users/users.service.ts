import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Student, Parent, Teacher, Admin } from '../entities';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['student', 'parent', 'teacher', 'admin'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['student', 'parent', 'teacher', 'admin'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByRole(userType: UserRole): Promise<User[]> {
    return this.userRepository.find({
      where: { userType },
      relations: ['student', 'parent', 'teacher', 'admin'],
    });
  }

  async deactivateUser(id: string): Promise<User> {
    const user = await this.findOne(id);
    await this.userRepository.update(id, { isActive: false });
    return this.findOne(id);
  }

  async activateUser(id: string): Promise<User> {
    const user = await this.findOne(id);
    await this.userRepository.update(id, { isActive: true });
    return this.findOne(id);
  }
}
