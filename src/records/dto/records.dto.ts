import { ApiProperty } from '@nestjs/swagger';

export class SubjectRecordDto {
    @ApiProperty()
    subject: string;

    @ApiProperty()
    assignmentScore: number;

    @ApiProperty()
    testScore: number;

    @ApiProperty()
    examScore: number;

    @ApiProperty()
    totalScore: number;

    @ApiProperty()
    grade: string;

    @ApiProperty()
    remark: string;
}

export class ReportCardSummaryDto {
    @ApiProperty()
    averageScore: number;

    @ApiProperty()
    totalScore: number;

    @ApiProperty()
    numberOfSubjects: number;

    @ApiProperty()
    attendancePercentage: number;
}

export class ReportCardStudentInfoDto {
    @ApiProperty()
    fullName: string;

    @ApiProperty()
    className: string;

    @ApiProperty()
    studentId: string;
}

export class ReportCardDto {
    @ApiProperty()
    academicYear: string;

    @ApiProperty()
    term: string;

    @ApiProperty()
    student: ReportCardStudentInfoDto;

    @ApiProperty()
    summary: ReportCardSummaryDto;

    @ApiProperty({ type: [SubjectRecordDto] })
    subjects: SubjectRecordDto[];

    @ApiProperty()
    teacherRemark: string;

    @ApiProperty()
    principalRemark: string;
}

export class TermDto {
    @ApiProperty()
    academicYear: string;

    @ApiProperty()
    term: string;

    @ApiProperty()
    label: string;
}

export class PerformanceAnalyticsDto {
    @ApiProperty()
    termLabel: string;

    @ApiProperty()
    averageScore: number;
}
