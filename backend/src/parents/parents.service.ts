import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parent } from './parent.entity';
import { Child } from '../children/child.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ParentsService {
  constructor(
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,
    @InjectRepository(Child)
    private readonly childRepository: Repository<Child>,
  ) {}

  async createParentProfile(params: {
    user: User;
    phoneNumber?: string | null;
    address?: string | null;
  }): Promise<Parent> {
    const existing = await this.parentRepository.findOne({
      where: { user: { id: params.user.id } },
    });
    if (existing) {
      return existing;
    }

    const phoneNumber = params.phoneNumber?.trim();
    if (!phoneNumber) {
      throw new BadRequestException('Numer telefonu rodzica jest wymagany');
    }

    const parent = this.parentRepository.create({
      user: params.user,
      phone_number: phoneNumber,
      address: params.address?.trim() || undefined,
    });

    return this.parentRepository.save(parent);
  }

  async getMyContact(userId: string) {
    const parent = await this.parentRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!parent) throw new NotFoundException('Profil rodzica nie istnieje');

    return {
      id: parent.id,
      firstName: parent.user.firstName,
      lastName: parent.user.lastName,
      email: parent.user.email,
      phoneNumber: parent.phone_number,
      address: parent.address,
    };
  }

  async getContactByParentId(parentId: string) {
    const parent = await this.parentRepository.findOne({
      where: { id: parentId },
      relations: ['user'],
    });
    if (!parent) throw new NotFoundException('Rodzic nie znaleziony');

    return {
      id: parent.id,
      firstName: parent.user.firstName,
      lastName: parent.user.lastName,
      email: parent.user.email,
      phoneNumber: parent.phone_number,
      address: parent.address,
    };
  }

  async getContactForChild(params: {
    childId: string;
    requester: { id: string; role: 'ADMIN' | 'CAREGIVER' | 'PARENT' };
  }) {
    const child = await this.childRepository.findOne({
      where: { id: params.childId },
      relations: ['parent', 'group', 'group.caregiver'],
    });
    if (!child) throw new NotFoundException('Dziecko nie znalezione');

    if (!child.parent) throw new NotFoundException('Brak przypisanego rodzica');

    // ADMIN ma dostęp zawsze
    if (params.requester.role === 'ADMIN') {
      const parent = await this.parentRepository.findOne({
        where: { user: { id: child.parent.id } },
        relations: ['user'],
      });
      if (!parent) throw new NotFoundException('Profil rodzica nie istnieje');
      return {
        id: parent.id,
        firstName: parent.user.firstName,
        lastName: parent.user.lastName,
        email: parent.user.email,
        phoneNumber: parent.phone_number,
        address: parent.address,
      };
    }

    // CAREGIVER musi być przypisany do grupy tego dziecka
    if (params.requester.role === 'CAREGIVER') {
      const caregiverId = child.group?.caregiver?.id;
      if (!caregiverId || caregiverId !== params.requester.id) {
        throw new ForbiddenException(
          'Brak uprawnień do danych rodzica tego dziecka',
        );
      }
      const parent = await this.parentRepository.findOne({
        where: { user: { id: child.parent.id } },
        relations: ['user'],
      });
      if (!parent) throw new NotFoundException('Profil rodzica nie istnieje');
      return {
        id: parent.id,
        firstName: parent.user.firstName,
        lastName: parent.user.lastName,
        email: parent.user.email,
        phoneNumber: parent.phone_number,
        address: parent.address,
      };
    }

    throw new ForbiddenException('Brak uprawnień do danych rodzica');
  }
}

