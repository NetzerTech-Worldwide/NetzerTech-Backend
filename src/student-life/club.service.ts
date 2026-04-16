import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Student, Club, StudentClub, ClubEvent, StudentClubEvent, ClubAnnouncement } from '../entities';
import { ClubStatus, ClubRole } from '../entities';
import { CreateClubDto, ClubStatsDto, ClubOverviewDto, ClubEventDto, ClubDetailDto } from './dto/club.dto';

@Injectable()
export class ClubService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Student) private studentRepository: Repository<Student>,
        @InjectRepository(Club) private clubRepository: Repository<Club>,
        @InjectRepository(StudentClub) private studentClubRepository: Repository<StudentClub>,
        @InjectRepository(ClubEvent) private clubEventRepository: Repository<ClubEvent>,
        @InjectRepository(StudentClubEvent) private studentClubEventRepository: Repository<StudentClubEvent>,
        @InjectRepository(ClubAnnouncement) private clubAnnouncementRepository: Repository<ClubAnnouncement>,
    ) { }

    private async getStudent(userId: string): Promise<Student> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['student'],
        });
        if (!user || !user.student) {
            throw new NotFoundException('Student profile not found');
        }
        return user.student;
    }

    async getStats(userId: string): Promise<ClubStatsDto> {
        const student = await this.getStudent(userId);

        const memberships = await this.studentClubRepository.find({
            where: { studentId: student.id }
        });

        const clubsJoined = memberships.length;
        const participationCredits = memberships.reduce((sum, m) => sum + m.creditsEarned, 0);
        const leadershipRoles = memberships.filter(m => m.role === ClubRole.LEAD).length;

        return {
            clubsJoined,
            participationCredits,
            leadershipRoles
        };
    }

    async getAllClubs(userId: string): Promise<ClubOverviewDto[]> {
        const student = await this.getStudent(userId);

        // Fetch all approved clubs
        const clubs = await this.clubRepository.find({
            where: { status: ClubStatus.APPROVED }
        });

        const memberships = await this.studentClubRepository.find({
            where: { studentId: student.id }
        });
        const joinedClubIds = new Set(memberships.map(m => m.clubId));

        // Get member counts for each club
        const membersCounts = await this.studentClubRepository
            .createQueryBuilder('sc')
            .select('sc.club_id', 'clubId')
            .addSelect('COUNT(sc.id)', 'count')
            .groupBy('sc.club_id')
            .getRawMany();
        
        const countMap = new Map(membersCounts.map(mc => [mc.clubId, parseInt(mc.count)]));

        return clubs.map(club => ({
            id: club.id,
            name: club.name,
            description: club.description,
            memberCount: countMap.get(club.id) || 0,
            meetingDay: club.meetingDay,
            isJoined: joinedClubIds.has(club.id),
            status: club.status
        }));
    }

    async getMyClubs(userId: string): Promise<ClubOverviewDto[]> {
        const student = await this.getStudent(userId);

        const memberships = await this.studentClubRepository.find({
            where: { studentId: student.id },
            relations: ['club']
        });

        // Get member counts to show on the card
        const joinedClubIds = memberships.map(m => m.clubId);
        let countMap = new Map();
        if (joinedClubIds.length > 0) {
            const membersCounts = await this.studentClubRepository
                .createQueryBuilder('sc')
                .select('sc.club_id', 'clubId')
                .addSelect('COUNT(sc.id)', 'count')
                .where('sc.club_id IN (:...ids)', { ids: joinedClubIds })
                .groupBy('sc.club_id')
                .getRawMany();
            countMap = new Map(membersCounts.map(mc => [mc.clubId, parseInt(mc.count)]));
        }

        return memberships.map(m => ({
            id: m.club.id,
            name: m.club.name,
            description: m.club.description,
            memberCount: countMap.get(m.clubId) || 0,
            meetingDay: m.club.meetingDay,
            isJoined: true,
            status: m.club.status,
            role: m.role,
            creditsEarned: m.creditsEarned
        }));
    }

    async getLeadershipClubs(userId: string): Promise<ClubOverviewDto[]> {
        const student = await this.getStudent(userId);

        // Include clubs that are pending creation by this user
        const clubsILead = await this.clubRepository.find({
            where: { createdById: student.id }
        });

        // Get member counts
        const clubIds = clubsILead.map(c => c.id);
        let countMap = new Map();
        if (clubIds.length > 0) {
            const membersCounts = await this.studentClubRepository
                .createQueryBuilder('sc')
                .select('sc.club_id', 'clubId')
                .addSelect('COUNT(sc.id)', 'count')
                .where('sc.club_id IN (:...ids)', { ids: clubIds })
                .groupBy('sc.club_id')
                .getRawMany();
            countMap = new Map(membersCounts.map(mc => [mc.clubId, parseInt(mc.count)]));
        }

        return clubsILead.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description,
            memberCount: countMap.get(c.id) || 0,
            meetingDay: c.meetingDay,
            isJoined: true,
            status: c.status,
            role: ClubRole.LEAD,
            creditsEarned: 0
        }));
    }

    async createClub(userId: string, dto: CreateClubDto) {
        const student = await this.getStudent(userId);

        const newClub = this.clubRepository.create({
            name: dto.name,
            description: dto.description,
            meetingDay: dto.meetingDay,
            advisorName: dto.teacherAdvisor,
            status: ClubStatus.PENDING,
            createdById: student.id
        });

        await this.clubRepository.save(newClub);

        return { message: 'Club creation proposal submitted for approval.' };
    }

    async joinClub(userId: string, clubId: string) {
        const student = await this.getStudent(userId);
        const club = await this.clubRepository.findOne({ where: { id: clubId } });
        if (!club) throw new NotFoundException('Club not found');
        if (club.status !== ClubStatus.APPROVED) throw new BadRequestException('Cannot join a club that is not approved');

        const existing = await this.studentClubRepository.findOne({
            where: { studentId: student.id, clubId }
        });

        if (existing) throw new BadRequestException('Already a member of this club');

        const membership = this.studentClubRepository.create({
            studentId: student.id,
            clubId: club.id,
            role: ClubRole.MEMBER
        });

        await this.studentClubRepository.save(membership);
        return { message: "Successfully joined " + club.name + "!" };
    }

    async leaveClub(userId: string, clubId: string) {
        const student = await this.getStudent(userId);
        const existing = await this.studentClubRepository.findOne({
            where: { studentId: student.id, clubId }
        });

        if (!existing) throw new BadRequestException('You are not a member of this club');
        if (existing.role === ClubRole.LEAD) throw new BadRequestException('Club leads cannot leave. Request ownership transfer first.');

        await this.studentClubRepository.remove(existing);
        return { message: 'Successfully left the club.' };
    }

    async getUpcomingEvents(userId: string): Promise<ClubEventDto[]> {
        const student = await this.getStudent(userId);

        const events = await this.clubEventRepository.find({
            relations: ['club'],
            order: { date: 'ASC' } // In real life, add Where date >= today
        });

        return events.map(e => ({
            id: e.id,
            clubName: e.club?.name || 'Unknown Club',
            title: e.title,
            date: e.date,
            startTime: e.startTime,
            endTime: e.endTime,
            location: e.location
        }));
    }

    async confirmEventAttendance(userId: string, eventId: string) {
        const student = await this.getStudent(userId);
        const event = await this.clubEventRepository.findOne({ where: { id: eventId }, relations: ['club'] });
        if (!event) throw new NotFoundException('Event not found');

        const existing = await this.studentClubEventRepository.findOne({
            where: { studentId: student.id, eventId }
        });

        if (existing) throw new BadRequestException('Already registered for this event');

        const attendance = this.studentClubEventRepository.create({
            studentId: student.id,
            eventId
        });

        await this.studentClubEventRepository.save(attendance);
        return { message: "Successfully registered for " + event.title + "!" };
    }

    async getClubDetails(userId: string, clubId: string): Promise<ClubDetailDto> {
        const student = await this.getStudent(userId);
        const club = await this.clubRepository.findOne({ where: { id: clubId } });
        if (!club) throw new NotFoundException('Club not found');

        const announcements = await this.clubAnnouncementRepository.find({
            where: { clubId },
            order: { createdAt: 'DESC' }
        });

        const memberships = await this.studentClubRepository.find({
            where: { clubId },
            relations: ['student']
        });

        // Find club lead
        const lead = memberships.find(m => m.role === ClubRole.LEAD);

        return {
            id: club.id,
            name: club.name,
            description: club.description,
            advisorName: club.advisorName || 'Pending',
            meetingDay: club.meetingDay || 'TBD',
            meetingTime: club.meetingTime || 'TBD',
            totalMembers: memberships.length,
            clubLead: lead?.student ? lead.student.fullName : 'TBD',
            announcements: announcements.map(a => ({
                title: a.title,
                content: a.content,
                postedBy: a.postedBy,
                date: a.createdAt.toISOString().split('T')[0]
            })),
            members: memberships.map(m => ({
                name: m.student.fullName,
                credits: m.creditsEarned,
                className: m.student.gradeLevel || 'Unknown', // Need to resolve class accurately in production
                role: m.role
            }))
        };
    }
}
