import { ApiProperty } from '@nestjs/swagger';

export class StudentSubjectDto {
  @ApiProperty({ description: 'Subject name', example: 'Mathematics' })
  subject: string;

  @ApiProperty({ description: 'Subject type', example: 'compulsory', enum: ['compulsory', 'elective'] })
  type: string;

  @ApiProperty({ description: 'Teacher full name', example: 'John Teacher' })
  teacherName: string;
}

export class StudentCoursesDto {
  @ApiProperty({ type: [StudentSubjectDto], description: 'List of student enrolled subjects' })
  subjects: StudentSubjectDto[];

  @ApiProperty({ description: 'Number of subjects enrolled', example: 5 })
  enrolledSubjects: number;

  @ApiProperty({ description: 'Average progress of enrolled subjects', example: 85.5 })
  averageProgress: number;
}


