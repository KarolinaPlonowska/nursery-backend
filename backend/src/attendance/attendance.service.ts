import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { Child } from '../children/child.entity';
import { User } from '../users/user.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name); // logger lokalny

  constructor(
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,
    @InjectRepository(Child)
    private childRepo: Repository<Child>,
  ) {}

  async create(dto: CreateAttendanceDto) {
    this.logger.log(`Creating/updating attendance for child ${dto.childId}`);

    const child = await this.childRepo.findOneBy({ id: dto.childId });
    if (!child) {
      this.logger.warn(`Child not found: ${dto.childId}`);
      throw new Error('Child not found');
    }

    // Sprawdź czy już istnieje rekord dla tego dziecka i daty
    const existingAttendance = await this.attendanceRepo.findOne({
      where: {
        child: { id: dto.childId },
        date: dto.date,
      },
    });

    if (existingAttendance) {
      // Aktualizuj istniejący rekord
      this.logger.log(
        `Updating existing attendance ${existingAttendance.id} from ${existingAttendance.status} to ${dto.status}`,
      );
      existingAttendance.status = dto.status;
      existingAttendance.notes = dto.notes || '';
      return this.attendanceRepo.save(existingAttendance);
    }

    // Utwórz nowy rekord
    const attendance = this.attendanceRepo.create({
      child,
      date: dto.date,
      status: dto.status,
      notes: dto.notes,
    });

    this.logger.log(`Creating new attendance for child ${dto.childId}`);

    return this.attendanceRepo.save(attendance);
  }

  async findByChild(childId: string, requestingUser: User) {
    this.logger.log(
      `findByChild - childId: ${childId}, user: ${JSON.stringify(requestingUser)}`,
    );

    const child = await this.childRepo.findOne({
      where: { id: childId },
      relations: ['parent', 'group', 'group.caregiver'],
    });

    if (!child) throw new NotFoundException();

    this.logger.log(
      `Child found - groupId: ${child.group?.id}, group.caregiver.id: ${child.group?.caregiver?.id}`,
    );

    // PARENT: może widzieć tylko swoje dzieci
    if (
      requestingUser.role === 'PARENT' &&
      child.parent?.id !== requestingUser.id
    ) {
      this.logger.warn('PARENT access denied');
      throw new ForbiddenException('Nie masz dostępu do tego dziecka.');
    }

    // CAREGIVER: może widzieć dzieci ze swojej grupy
    if (
      requestingUser.role === 'CAREGIVER' &&
      child.group?.caregiver?.id !== requestingUser.id
    ) {
      this.logger.warn(
        `CAREGIVER access denied - group.caregiver.id=${child.group?.caregiver?.id}, user.id=${requestingUser.id}`,
      );
      throw new ForbiddenException('Nie masz dostępu do tej grupy.');
    }

    return this.attendanceRepo.find({
      where: { child: { id: childId } },
      order: { date: 'DESC' },
    });
  }

  async updateStatus(id: string, status: string) {
    const attendance = await this.attendanceRepo.findOneBy({ id });
    if (!attendance) {
      throw new Error('Attendance not found');
    }
    attendance.status = status;
    return this.attendanceRepo.save(attendance);
  }

  async remove(id: string) {
    const attendance = await this.attendanceRepo.findOneBy({ id });
    if (!attendance) {
      throw new Error('Attendance not found');
    }
    return this.attendanceRepo.remove(attendance);
  }
}
