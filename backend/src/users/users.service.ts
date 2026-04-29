// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Logger } from '@nestjs/common';
import { EmailService } from '../auth/services/email.service';
import { Message } from '../messages/message.entity';
import { Announcement } from '../announcements/announcement.entity';
import { Group } from '../groups/group.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name); // logger lokalny
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(Announcement)
    private announcementsRepository: Repository<Announcement>,
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    private readonly emailService: EmailService,
    private dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);

    // Ustaw groupId tylko jeśli użytkownik to caregiver
    if (createUserDto.role === 'CAREGIVER' && createUserDto.groupId) {
      user.groupId = createUserDto.groupId;
    }

    const saved = await this.usersRepository.save(user);

    this.logger.log(
      `Utworzono nowego użytkownika: ${saved.id} (${saved.role})`,
    );

    return saved;
  }

  async findAll(): Promise<User[]> {
    this.logger.log('Pobieranie listy wszystkich użytkowników');
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      this.logger.warn(`Nie znaleziono użytkownika o ID: ${id}`);
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }
  async findByEmail(email: string) {
    this.logger.log(`Wyszukiwanie użytkownika po e-mailu: ${email}`);
    return this.usersRepository.findOne({ where: { email } });
  }

  async countAdmins(): Promise<number> {
    return this.usersRepository.count({ where: { role: 'ADMIN' } });
  }

  async updateRole(
    userId: string,
    newRole: 'ADMIN' | 'PARENT' | 'CAREGIVER',
  ): Promise<User> {
    const user = await this.findOne(userId);
    const oldRole = user.role;
    user.role = newRole;
    const updated = await this.usersRepository.save(user);
    this.logger.log(
      `Zmieniono rolę użytkownika ${userId}: ${oldRole} → ${newRole}`,
    );
    return updated;
  }

  async verifyEmail(userId: string): Promise<User> {
    const user = await this.findOne(userId);
    user.emailVerified = true;
    const updated = await this.usersRepository.save(user);
    this.logger.log(
      `Zweryfikowano email użytkownika: ${userId} (${user.email})`,
    );
    return updated;
  }

  async deleteUser(
    userId: string,
    requestingUserId?: string,
  ): Promise<{ message: string }> {
    const user = await this.findOne(userId);

    // Ochrona: sprawdź czy użytkownik do usunięcia jest administratorem
    if (user.role === 'ADMIN') {
      // Jeśli próbujesz usunąć siebie - zawsze zakaż
      if (userId === requestingUserId) {
        this.logger.warn(`Administrator ${userId} próbował się usunąć`);
        throw new ForbiddenException('Nie możesz usunąć siebie z systemu');
      }

      // Jeśli próbujesz usunąć innego administratora - zakaż
      this.logger.warn(
        `Administrator ${requestingUserId} próbował usunąć administratora ${userId}`,
      );
      throw new ForbiddenException('Nie możesz usunąć innego administratora');
    }

    // Najpierw usuń wszystkie powiązania przed usunięciem użytkownika
    
    // 1. Usuń wiadomości
    await this.messagesRepository.delete({ senderId: userId });
    await this.messagesRepository.delete({ receiverId: userId });
    this.logger.log(`Usunięto wiadomości powiązane z użytkownikiem: ${userId}`);

    // 2. Usuń powiązania z ogłoszeniami (announcement_views)
    await this.dataSource
      .createQueryBuilder()
      .delete()
      .from('announcement_views')
      .where('userId = :userId', { userId })
      .execute();
    this.logger.log(`Usunięto powiązania z widokami ogłoszeń: ${userId}`);

    // 3. Zaktualizuj ogłoszenia gdzie użytkownik jest autorem (ustaw authorId na null)
    await this.announcementsRepository
      .createQueryBuilder()
      .update(Announcement)
      .set({ authorId: null, author: null })
      .where('authorId = :authorId', { authorId: userId })
      .execute();
    this.logger.log(`Zaktualizowano ogłoszenia autorstwa użytkownika: ${userId}`);

    // 4. Usuń użytkownika z grup jako caregiver (ustaw caregiverId na null)
    await this.groupsRepository
      .createQueryBuilder()
      .update(Group)
      .set({ caregiverId: null, caregiver: null })
      .where('caregiverId = :caregiverId', { caregiverId: userId })
      .execute();
    this.logger.log(`Usunięto użytkownika z grup jako opiekuna: ${userId}`);

    // 5. Teraz usuń użytkownika
    await this.usersRepository.remove(user);
    this.logger.log(
      `Usunięto użytkownika: ${userId} (${user.email}) - rola: ${user.role}`,
    );
    return { message: `User ${user.email} deleted successfully` };
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { refreshToken },
    });
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.usersRepository.update(userId, {
      refreshToken,
      refreshTokenExpiresAt: expiresAt,
    });
    this.logger.log(`Refresh token zaktualizowany dla użytkownika: ${userId}`);
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.usersRepository.update(userId, { password: hashedPassword });
    this.logger.log(`Hasło zmienione dla użytkownika: ${userId}`);
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      refreshToken: null as any,
      refreshTokenExpiresAt: null as any,
    });
  }

  async updateProfile(
    userId: string,
    updateData: { firstName?: string; lastName?: string; email?: string },
  ): Promise<User> {
    const user = await this.findOne(userId);
    
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.findByEmail(updateData.email);
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Email jest już używany');
      }
    }

    if (updateData.firstName !== undefined) {
      user.firstName = updateData.firstName;
    }
    if (updateData.lastName !== undefined) {
      user.lastName = updateData.lastName;
    }
    if (updateData.email !== undefined) {
      user.email = updateData.email;
    }

    const updated = await this.usersRepository.save(user);
    return updated;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newHashedPassword: string,
  ): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    
    if (!user) {
      throw new NotFoundException('Użytkownik nie znaleziony');
    }

    // Weryfikacja obecnego hasła będzie wykonana w kontrolerze
    await this.usersRepository.update(userId, { password: newHashedPassword });
    this.logger.log(`Hasło zmienione dla użytkownika: ${userId}`);
    this.logger.log(`Dane użytkownika: email=${user.email}, firstName=${user.firstName}, lastName=${user.lastName}`);
    
    // Send email notification
    try {
      await this.emailService.sendPasswordChangeNotification(user.email, user.firstName);
      this.logger.log(`Email powiadomienia o zmianie hasła wysłany do: ${user.email} (firstName: ${user.firstName})`);
    } catch (emailError) {
      this.logger.error(`Błąd wysyłania emaila o zmianie hasła: ${emailError.message}`);
      // Don't throw - password was already changed successfully
    }
  }
}
