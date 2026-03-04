import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Student, StudentClassActivity, StudentAssignment, Attendance, ClassActivityStatus, AssignmentStatus } from '../entities';
import { ReportCardDto, TermDto, PerformanceAnalyticsDto, SubjectRecordDto } from './dto/records.dto';

@Injectable()
export class RecordsService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(StudentClassActivity)
        private classActivityRepository: Repository<StudentClassActivity>,
        @InjectRepository(StudentAssignment)
        private assignmentRepository: Repository<StudentAssignment>,
        @InjectRepository(Attendance)
        private attendanceRepository: Repository<Attendance>
    ) { }

    async getAvailableTerms(userId: string): Promise<TermDto[]> {
        // In a full production app with a formal Terms table, this would group by Term ID.
        // Given the current schema, we dynamically extract from records or mock for the UI demo:
        return [
            { academicYear: '2024/2025', term: 'First', label: 'First Term - 2024/2025' },
            { academicYear: '2024/2025', term: 'Second', label: 'Second Term - 2024/2025' },
        ];
    }

    async getPerformanceAnalytics(userId: string): Promise<PerformanceAnalyticsDto[]> {
        // Mocking historical trend logic based on UI reqs (can be wired to real past terms later)
        return [
            { termLabel: 'First Term', averageScore: 65 },
            { termLabel: 'Second Term', averageScore: 78 },
            { termLabel: 'Third Term', averageScore: 82 },
            { termLabel: 'Current', averageScore: 89 },
        ];
    }

    async getReportCard(userId: string, academicYear: string, term: string): Promise<ReportCardDto> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['student', 'student.classes', 'student.academicProgress'],
        });

        if (!user || !user.student) {
            throw new NotFoundException('Student profile not found');
        }

        const studentId = user.student.id;

        // Fetch all graded assignments for the student
        const assignments = await this.assignmentRepository.find({
            where: { student: { id: studentId }, status: AssignmentStatus.GRADED },
            relations: ['assignment', 'assignment.class'],
        });

        // Fetch all graded exams and tests
        const activities = await this.classActivityRepository.find({
            where: { student: { id: studentId }, status: ClassActivityStatus.GRADED }, // assuming tests are graded
            relations: ['classActivity', 'classActivity.class'],
        });

        // Bucket scores by Subject Name (derived from Class)
        const subjectMap: Record<string, SubjectRecordDto> = {};

        // 1. Process Assignments
        for (const sub of assignments) {
            const className = sub.assignment.class.subject || sub.assignment.class.title;
            if (!subjectMap[className]) {
                subjectMap[className] = this.initSubject(className);
            }
            subjectMap[className].assignmentScore += Number(sub.grade || 0);
        }

        // 2. Process CBTs (Tests / Exams)
        for (const act of activities) {
            const className = act.classActivity.class.subject || act.classActivity.class.title;
            if (!subjectMap[className]) {
                subjectMap[className] = this.initSubject(className);
            }

            const score = Number(act.score || 0);

            // We assume activities with 'test' in title are CA tests, else Exams
            if (act.classActivity.title.toLowerCase().includes('test')) {
                subjectMap[className].testScore += score;
            } else {
                subjectMap[className].examScore += score;
            }
        }

        // 3. Compute Totals and Grades mapping
        let totalScoreSum = 0;
        const subjectsArray = Object.values(subjectMap).map(subj => {
            subj.totalScore = subj.assignmentScore + subj.testScore + subj.examScore;

            // Grade limits (100% scale)
            if (subj.totalScore >= 75) { subj.grade = 'A'; subj.remark = 'Excellent'; }
            else if (subj.totalScore >= 65) { subj.grade = 'B'; subj.remark = 'Very Good'; }
            else if (subj.totalScore >= 50) { subj.grade = 'C'; subj.remark = 'Credit'; }
            else if (subj.totalScore >= 40) { subj.grade = 'D'; subj.remark = 'Pass'; }
            else { subj.grade = 'F'; subj.remark = 'Fail'; }

            totalScoreSum += subj.totalScore;
            return subj;
        });

        const numberOfSubjects = subjectsArray.length;
        const averageScore = numberOfSubjects > 0 ? Math.round(totalScoreSum / numberOfSubjects) : 0;

        return {
            academicYear,
            term,
            student: {
                fullName: user.student.fullName,
                className: user.student.classes?.length > 0 ? user.student.classes[0].title : 'Unassigned',
                studentId: user.student.id.substring(0, 8),
            },
            summary: {
                averageScore,
                totalScore: totalScoreSum,
                numberOfSubjects,
                attendancePercentage: 92, // Mocked overall attendance logic
                gpa: user.student.academicProgress?.gpa || 0.0,
                completedCredits: user.student.academicProgress ? `${user.student.academicProgress.completedCredits}/${user.student.academicProgress.totalCredits}` : '0/0',
                classRank: '4th/32', // Mocked, ideally requires a rank computation over the whole class
            },
            subjects: subjectsArray,
            teacherRemark: averageScore >= 75 ? 'An outstanding performance this term. Keep it up!' :
                averageScore >= 50 ? 'A good effort, but there is room for improvement.' :
                    'Needs urgent attention and more dedication to studies.',
            teacherName: user.student.classes?.length > 0 && user.student.classes[0].teacher ? user.student.classes[0].teacher.fullName : 'Class Teacher',
            principalRemark: averageScore >= 75 ? 'Excellent result. Promoted to the next class.' :
                averageScore >= 50 ? 'Passed. Promoted.' :
                    'Failed. Advised to repeat.',
            principalName: 'Admin',
        };
    }

    private initSubject(name: string): SubjectRecordDto {
        return {
            subject: name,
            assignmentScore: 0,
            testScore: 0,
            examScore: 0,
            totalScore: 0,
            grade: '-',
            remark: '-',
        };
    }

    async downloadReportCard(userId: string, academicYear: string, term: string): Promise<{ downloadUrl: string }> {
        // In a full implementation, this method would use a library like PDFKit or Puppeteer
        // to render the HTML report card into a PDF buffer, upload it to S3/Cloudinary, 
        // and return the secure signed URL. 
        // For now, we return a mocked URL to unblock the frontend's download button UX.

        // Validate the student exists
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['student'],
        });

        if (!user || !user.student) {
            throw new NotFoundException('Student profile not found');
        }

        return {
            downloadUrl: `https://api.netzertech.co/storage/report-cards/${user.student.id}-${academicYear.replace('/', '-')}-${term}.pdf`
        };
    }
}
