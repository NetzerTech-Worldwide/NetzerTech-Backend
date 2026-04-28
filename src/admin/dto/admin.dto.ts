import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
    @ApiProperty()
    studentFirstName: string;

    @ApiProperty()
    studentLastName: string;

    @ApiProperty()
    gender: string;

    @ApiProperty()
    dateOfBirth: string;

    @ApiProperty()
    class: string;

    @ApiPropertyOptional()
    studentEmail?: string;

    @ApiProperty()
    parentTitle: string;

    @ApiProperty()
    parentFirstName: string;

    @ApiProperty()
    parentLastName: string;

    @ApiProperty()
    parentPhone: string;

    @ApiProperty()
    parentEmail: string;

    @ApiPropertyOptional()
    parentOccupation?: string;

    @ApiPropertyOptional()
    parentAddress?: string;

    @ApiProperty()
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
