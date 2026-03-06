import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Student, Parent } from '../entities';
import { UpdatePersonalInfoDto, UpdateContactInfoDto, UpdateGuardianInfoDto, UpdatePasswordDto } from './dto/profile.dto';
import * as bcrypt from 'bcryptjs';
import { AttendanceService } from '../attendance/attendance.service';
import { RecordsService } from '../records/records.service';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Student) private studentRepository: Repository<Student>,
        @InjectRepository(Parent) private parentRepository: Repository<Parent>,
        private attendanceService: AttendanceService,
        private recordsService: RecordsService,
    ) { }

    async getProfile(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['student', 'student.parent'],
        });

        if (!user || (!user.student && !user.parent)) {
            throw new NotFoundException('Profile not found');
        }

        const student = user.student;

        if (student) {
            const parent = student.parent || null;

            // Fetch overview metrics
            let attendancePercentage = 0;
            let totalClasses = 0;
            try {
                const attendanceOverview = await this.attendanceService.getOverview(userId);
                attendancePercentage = attendanceOverview.attendancePercentage;
                totalClasses = attendanceOverview.totalClasses;
            } catch (e) {
                // Safe fallback
            }

            let averageGrade = 0;
            try {
                // Try to fetch current term if available, or just fallback
                const reportCard = await this.recordsService.getReportCard(userId, '2024/2025', 'First');
                averageGrade = reportCard.summary.averageScore;
            } catch (e) {
                // Safe fallback
            }

            return {
                metrics: {
                    attendancePercentage,
                    totalClasses,
                    averageGrade,
                },
                personalInfo: {
                    fullName: student.fullName,
                    studentId: student.studentId,
                    matricNumber: student.matricNumber,
                    admissionDate: student.admissionDate,
                    dateOfBirth: student.dateOfBirth,
                    gender: student.gender,
                    bloodGroup: student.bloodGroup,
                    genotype: student.genotype,
                    medicalCondition: student.medicalCondition,
                    allergies: student.allergies,
                },
                contactInfo: {
                    phoneNumber: student.phoneNumber,
                    residentialAddress: student.residentialAddress,
                    stateOfOrigin: student.stateOfOrigin,
                    lga: student.lga,
                    nationality: student.nationality,
                },
                guardianInfo: parent ? {
                    fullName: parent.fullName,
                    relationship: parent.relationship,
                    phoneNumber: parent.phoneNumber,
                    email: parent.email,
                    occupation: parent.occupation,
                    address: parent.address,
                    workAddress: parent.workAddress,
                } : null,
            };
        } else {
            // Support for non-student profiles reading /profile directly
            return {
                personalInfo: { fullName: user.parent ? user.parent.fullName : user.email },
                contactInfo: {}
            }
        }
    }

    async updatePersonalInfo(userId: string, dto: UpdatePersonalInfoDto) {
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['student'] });
        if (!user || !user.student) throw new NotFoundException('Student profile not found');

        // Parse date if passed as string
        if (dto.dateOfBirth) {
            user.student.dateOfBirth = new Date(dto.dateOfBirth);
        }

        Object.assign(user.student, {
            gender: dto.gender,
            bloodGroup: dto.bloodGroup,
            genotype: dto.genotype,
            medicalCondition: dto.medicalCondition,
            allergies: dto.allergies,
        });

        await this.studentRepository.save(user.student);

        return { message: 'Personal info updated successfully' };
    }

    async updateContactInfo(userId: string, dto: UpdateContactInfoDto) {
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['student'] });
        if (!user || !user.student) throw new NotFoundException('Student profile not found');

        Object.assign(user.student, dto);
        await this.studentRepository.save(user.student);

        return { message: 'Contact info updated successfully' };
    }

    async updateGuardianInfo(userId: string, dto: UpdateGuardianInfoDto) {
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['student', 'student.parent'] });
        if (!user || !user.student) throw new NotFoundException('Student profile not found');

        let parent = user.student.parent;
        if (!parent) {
            parent = this.parentRepository.create();
        }

        Object.assign(parent, {
            fullName: dto.fullName || parent.fullName || 'Guardian',
            relationship: dto.relationship,
            phoneNumber: dto.phoneNumber,
            email: dto.email,
            occupation: dto.occupation,
            address: dto.workAddress, // Could be residential address or work address depending on what they pass
            workAddress: dto.workAddress,
        });

        const savedParent = await this.parentRepository.save(parent);

        if (!user.student.parent) {
            user.student.parent = savedParent;
            await this.studentRepository.save(user.student);
        }

        return { message: 'Guardian info updated successfully' };
    }

    async updatePassword(userId: string, dto: UpdatePasswordDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
        if (!isMatch) {
            throw new BadRequestException('Invalid old password');
        }

        user.password = await bcrypt.hash(dto.newPassword, 10);
        user.mustChangePassword = false;
        await this.userRepository.save(user);

        return { message: 'Password updated successfully' };
    }
}
