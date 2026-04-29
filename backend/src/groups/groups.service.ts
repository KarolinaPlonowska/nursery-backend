import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Child } from '../children/child.entity';
import { User } from '../users/user.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    @InjectRepository(Child)
    private childrenRepository: Repository<Child>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Group[]> {
    return this.groupsRepository.find({ relations: ['children', 'caregiver'] });
  }

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const group = this.groupsRepository.create(createGroupDto);
    return this.groupsRepository.save(group);
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.groupsRepository.findOne({ where: { id } });
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    Object.assign(group, updateGroupDto);
    return this.groupsRepository.save(group);
  }

  async assignChild(groupId: string, childId: string): Promise<Group> {
    const group = await this.groupsRepository.findOne({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    const child = await this.childrenRepository.findOne({
      where: { id: childId },
      relations: ['group'],
    });
    if (!child) {
      throw new NotFoundException(`Child with ID ${childId} not found`);
    }

    child.group = group;
    await this.childrenRepository.save(child);

    const updated = await this.groupsRepository.findOne({
      where: { id: groupId },
      relations: ['children'],
    });
    if (!updated) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }
    return updated;
  }

  async assignCaregiver(groupId: string, caregiverId: string): Promise<Group> {
    const group = await this.groupsRepository.findOne({
      where: { id: groupId },
      relations: ['caregiver'],
    });
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    const caregiver = await this.usersRepository.findOne({
      where: { id: caregiverId },
    });
    if (!caregiver) {
      throw new NotFoundException(`User with ID ${caregiverId} not found`);
    }

    if (caregiver.role !== 'CAREGIVER') {
      throw new BadRequestException('Selected user is not a caregiver');
    }

    group.caregiver = caregiver;
    group.caregiverId = caregiverId;

    return this.groupsRepository.save(group);
  }

  async removeCaregiver(groupId: string): Promise<Group> {
    const group = await this.groupsRepository.findOne({
      where: { id: groupId },
      relations: ['caregiver'],
    });
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    group.caregiver = null;
    group.caregiverId = null;

    return this.groupsRepository.save(group);
  }

  async findGroupsByCaregiver(caregiverId: string): Promise<Group[]> {
    console.log(`🔍 Szukam grup dla opiekuna (userId): ${caregiverId}`);
    
    // Zwróć tylko grupy przypisane do tego opiekuna (gdzie caregiverId === userId opiekuna)
    const groups = await this.groupsRepository.find({
      where: { 
        caregiverId, // caregiverId to userId opiekuna
      },
      relations: ['children', 'children.parent', 'caregiver'],
    });
    
    console.log(`✅ Znaleziono ${groups.length} grup dla opiekuna`);
    groups.forEach(g => console.log(`   - Grupa: ${g.name} (caregiverId: ${g.caregiverId})`));
    
    return groups;
  }

  async delete(id: string): Promise<void> {
    // Sprawdź czy grupa istnieje
    const group = await this.groupsRepository.findOne({
      where: { id },
      relations: ['children'],
    });
    
    if (!group) {
      throw new NotFoundException(`Grupa o ID ${id} nie istnieje`);
    }

    // Sprawdź czy grupa ma przypisane dzieci
    if (group.children && group.children.length > 0) {
      throw new BadRequestException(
        `Nie można usunąć grupy "${group.name}" - ma przypisane dzieci (${group.children.length}). Najpierw usuń lub przenieś dzieci do innych grup.`
      );
    }

    // Usuń grupę
    await this.groupsRepository.remove(group);
    console.log(`🗑️ Grupa "${group.name}" (${id}) została usunięta`);
  }
}
