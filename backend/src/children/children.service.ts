import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Child } from './child.entity';
import { CreateChildDto } from './dto/create-child.dto';
import { User } from '../users/user.entity';
import { Group } from '../groups/group.entity';
import { Attendance } from '../attendance/attendance.entity';

@Injectable()
export class ChildrenService {
  private readonly logger = new Logger(ChildrenService.name); // logger lokalny

  constructor(
    @InjectRepository(Child)
    private childrenRepository: Repository<Child>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  async create(createChildDto: CreateChildDto, admin: User): Promise<Child> {
    const parentId = createChildDto.parentId;
    let group: Group | null = null;

    // Jeśli admin podał ID grupy, sprawdź czy grupa istnieje
    if (createChildDto.groupId) {
      group = await this.groupsRepository.findOne({
        where: { id: createChildDto.groupId },
      });
      if (!group) {
        throw new Error('Group not found');
      }
    }

    // Jeśli admin nie podał ID rodzica, nie przypisuj rodzica
    if (!parentId) {
      const child = this.childrenRepository.create({
        firstName: createChildDto.firstName,
        lastName: createChildDto.lastName,
        birthDate: new Date(createChildDto.birthDate),
        group: group || undefined,
      });
      const saved = await this.childrenRepository.save(child);
      this.logger.log(
        `Dodano dziecko: ${saved.firstName} ${saved.lastName} (ID: ${saved.id}) przez admina ${admin.id}`,
      );
      return saved;
    }

    // Sprawdź czy rodzic istnieje
    const parent = await this.usersRepository.findOne({
      where: { id: parentId, role: 'PARENT' },
    });

    if (!parent) {
      throw new Error('Parent not found or is not a PARENT role');
    }

    const child = this.childrenRepository.create({
      firstName: createChildDto.firstName,
      lastName: createChildDto.lastName,
      birthDate: new Date(createChildDto.birthDate),
      parent: parent,
      group: group || undefined,
    });
    const saved = await this.childrenRepository.save(child);
    this.logger.log(
      `Dodano dziecko: ${saved.firstName} ${saved.lastName} (ID: ${saved.id}), Rodzic: ${parent.id} przez admina ${admin.id}`,
    );
    return saved;
  }

  async findAll(): Promise<Child[]> {
    this.logger.log('Pobieranie listy wszystkich dzieci');
    return this.childrenRepository.find({
      relations: ['parent', 'group'],
    });
  }

  async deleteChild(id: string): Promise<{ message: string }> {
    const child = await this.childrenRepository.findOne({ where: { id } });
    if (!child) {
      throw new Error(`Child with ID ${id} not found`);
    }
    
    // Najpierw usuń wszystkie rekordy frekwencji dla tego dziecka
    await this.attendanceRepository.delete({ child: { id } });
    this.logger.log(`Usunięto rekordy frekwencji dla dziecka: ${id}`);
    
    // Następnie usuń dziecko
    await this.childrenRepository.remove(child);
    this.logger.log(`Usunięto dziecko: ${id}`);
    return { message: 'Child deleted successfully' };
  }

  async updateChildGroup(
    childId: string,
    groupId: string | null,
  ): Promise<Child> {
    const child = await this.childrenRepository.findOne({
      where: { id: childId },
      relations: ['group', 'parent'],
    });
    if (!child) {
      throw new Error(`Child with ID ${childId} not found`);
    }
    if (groupId) {
      const group = await this.groupsRepository.findOne({
        where: { id: groupId },
      });
      if (!group) {
        throw new Error(`Group with ID ${groupId} not found`);
      }
      child.group = group;
    } else {
      child.group = null as any;
    }
    await this.childrenRepository.save(child);
    const updated = await this.childrenRepository.findOne({
      where: { id: childId },
      relations: ['group', 'parent'],
    });
    return updated as Child;
  }
}
