import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsNotEmpty, IsArray, IsEnum } from 'class-validator';

export class AdminClassOverviewDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    classTeacher: string;

    @ApiProperty()
    totalStudents: number;

    @ApiProperty()
    males: number;

    @ApiProperty()
    females: number;

    @ApiProperty()
    active: number;

    @ApiProperty()
    suspended: number;
}

export class AdminStudentDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    class: string;

    @ApiProperty()
    gender: string;

    @ApiProperty()
    age: number;

    @ApiProperty()
    parent: string;

    @ApiProperty()
    status: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    admission: string;
}

export class AdminTeacherDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    subjects: string;

    @ApiProperty()
    classes: string;

    @ApiProperty()
    status: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    joined: string;
}

export class AdminParentDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    children: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    occupation: string;

    @ApiProperty()
    address: string;

    @ApiProperty()
    status: string;
}

export class CreateStudentWithParentDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    studentId?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    studentFirstName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    studentLastName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    gender: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    dateOfBirth: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    class: string;

    @ApiPropertyOptional()
    @IsEmail()
    @IsOptional()
    studentEmail?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    parentTitle: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    parentFirstName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    parentLastName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    parentPhone: string;

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    parentEmail: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    parentOccupation?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    parentAddress?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    relationship: string;
}

export class CreateClassDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    level: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    section: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    classTeacherId?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    room?: string;
}

export class AdminSystemUserDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    role: string;

    @ApiProperty()
    department: string;

    @ApiProperty()
    status: string;

    @ApiProperty()
    lastLogin: string;

    @ApiProperty()
    createdDate: string;

    @ApiProperty()
    permissions: any[];
}

// --- POST DTOs ---

export class CreateTeacherDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    gender?: string;

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiPropertyOptional({ description: 'Primary subject the teacher teaches' })
    @IsString()
    @IsOptional()
    subject?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    qualification?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    experience?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    joinDate?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    address?: string;
}

export class CreateSystemUserDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'Role: Admin, Principal, Bursar, Teacher, etc.' })
    @IsString()
    @IsNotEmpty()
    role: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    department?: string;
}

export class CreateParentDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    occupation?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    address?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    relationship?: string;

    @ApiPropertyOptional({ description: 'Array of student IDs to link to this parent', type: [String] })
    @IsArray()
    @IsOptional()
    studentIds?: string[];
}

export class CreateAnnouncementDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiPropertyOptional({ description: 'Target audience: All, Students, Teachers, Parents' })
    @IsString()
    @IsOptional()
    targetAudience?: string;

    @ApiPropertyOptional({ description: 'Priority: Low, Medium, High, Urgent' })
    @IsString()
    @IsOptional()
    priority?: string;

    @ApiPropertyOptional({ description: 'Status: Draft, Published' })
    @IsString()
    @IsOptional()
    status?: string;
}

export class CreateEventDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    date: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    time?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    location?: string;

    @ApiPropertyOptional({ description: 'Target audience: All, Students, Teachers, Parents' })
    @IsString()
    @IsOptional()
    targetAudience?: string;

    @ApiPropertyOptional({ description: 'Status: Draft, Published' })
    @IsString()
    @IsOptional()
    status?: string;
}

export class CreateTimetablePeriodDto {
    @ApiProperty({ description: 'e.g. 08:00' })
    @IsString()
    @IsNotEmpty()
    startTime: string;

    @ApiProperty({ description: 'e.g. 08:45' })
    @IsString()
    @IsNotEmpty()
    endTime: string;

    @ApiProperty({ description: 'Class, Break, Assembly, etc.' })
    @IsString()
    @IsNotEmpty()
    periodType: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    className?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    subject?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    teacherId?: string;

    @ApiPropertyOptional({ description: 'e.g. Monday, Tuesday' })
    @IsString()
    @IsOptional()
    dayOfWeek?: string;
}

export class CreateExamTimetableDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    examName: string;

    @ApiProperty({ description: 'e.g. SS1, SS2, JS3' })
    @IsString()
    @IsNotEmpty()
    classLevel: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    startDate: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    endDate: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    subject?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    venue?: string;
}

export class SendIdCardsToVendorDto {
    @ApiProperty({ description: 'Array of ID card request IDs to send', type: [String] })
    @IsArray()
    @IsNotEmpty()
    requestIds: string[];
}

export class SendTicketEmailDto {
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    recipientEmail: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    subject: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    messageBody: string;
}

export class AddTicketNoteDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    note: string;
}
