import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';

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
