import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminInvitation } from '../entities/admin-invitation.entity';
import { EmailService } from './email.service';
import { UsersService } from '../../users/users.service';
import { PasswordService } from './password.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AdminInvitationService {
  private readonly logger = new Logger(AdminInvitationService.name);

  constructor(
    @InjectRepository(AdminInvitation)
    private invitationRepository: Repository<AdminInvitation>,
    private emailService: EmailService,
    private usersService: UsersService,
    private passwordService: PasswordService,
  ) {}

  /**
   * Wysyła zaproszenie do zostania administratorem
   */
  async sendInvitation(
    email: string,
    firstName: string,
    lastName: string,
    invitedBy: string,
  ) {
    const normalizedEmail = email.toLowerCase().trim();

    // Sprawdź czy email już istnieje w systemie
    const existingUser = await this.usersService.findByEmail(normalizedEmail);
    if (existingUser) {
      this.logger.warn(`Próba zaproszenia już zarejestrowanego emaila: ${normalizedEmail}`);
      throw new ConflictException('Ten email jest już zarejestrowany w systemie');
    }

    // Sprawdź czy jest już aktywne zaproszenie
    const existingInvitation = await this.invitationRepository.findOne({
      where: { 
        email: normalizedEmail, 
        isAccepted: false,
        expiresAt: new Date(Date.now()) // Sprawdź czy nie wygasło
      }
    });

    if (existingInvitation && existingInvitation.expiresAt > new Date()) {
      this.logger.warn(`Próba wysłania zaproszenia na email z aktywnym zaproszeniem: ${normalizedEmail}`);
      throw new ConflictException('Na ten email już zostało wysłane aktywne zaproszenie');
    }

    // Usuń stare, wygasłe lub nieaktywne zaproszenia dla tego emaila
    await this.invitationRepository.delete({ 
      email: normalizedEmail 
    });

    // Wygeneruj unikalny token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dni

    // Zapisz zaproszenie
    const invitation = this.invitationRepository.create({
      email: normalizedEmail,
      firstName,
      lastName,
      token,
      invitedBy,
      expiresAt,
    });

    await this.invitationRepository.save(invitation);

    // Wyślij email z zaproszeniem
    await this.emailService.sendAdminInvitation(
      normalizedEmail,
      firstName,
      token,
    );

    this.logger.log(`Zaproszenie administratora wysłane do: ${normalizedEmail} przez: ${invitedBy}`);

    return {
      message: 'Zaproszenie zostało wysłane',
      email: normalizedEmail,
      expiresAt,
    };
  }

  /**
   * Akceptuje zaproszenie i tworzy konto administratora
   */
  async acceptInvitation(token: string, password: string) {
    // Znajdź zaproszenie po tokenie
    const invitation = await this.invitationRepository.findOne({
      where: { 
        token,
        isAccepted: false 
      }
    });

    if (!invitation) {
      this.logger.warn(`Próba akceptacji nieistniejącego lub już użytego zaproszenia: ${token}`);
      throw new NotFoundException('Zaproszenie nie istnieje lub zostało już wykorzystane');
    }

    // Sprawdź czy zaproszenie nie wygasło
    if (invitation.expiresAt < new Date()) {
      this.logger.warn(`Próba akceptacji wygasłego zaproszenia: ${token}`);
      throw new BadRequestException('Zaproszenie wygasło');
    }

    // Walidacja siły hasła
    this.passwordService.validatePasswordStrength(password);

    // Sprawdź czy w międzyczasie nie utworzono użytkownika z tym emailem
    const existingUser = await this.usersService.findByEmail(invitation.email);
    if (existingUser) {
      this.logger.warn(`Email już zarejestrowany podczas akceptacji zaproszenia: ${invitation.email}`);
      throw new ConflictException('Email jest już zarejestrowany w systemie');
    }

    // Utwórz konto administratora
    const hashedPassword = await this.passwordService.hashPassword(password);
    const user = await this.usersService.create({
      username: invitation.email,
      password: hashedPassword,
      email: invitation.email,
      role: 'ADMIN',
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      emailVerified: true,
    });

    // Oznacz zaproszenie jako zaakceptowane
    invitation.isAccepted = true;
    await this.invitationRepository.save(invitation);

    this.logger.log(`Zaproszenie zaakceptowane - utworzono konto administratora: ${user.id} (${user.email})`);

    return {
      message: 'Konto administratora zostało utworzone',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  /**
   * Anuluje zaproszenie
   */
  async cancelInvitation(invitationId: string, cancelledBy: string) {
    const invitation = await this.invitationRepository.findOne({
      where: { 
        id: invitationId,
        isAccepted: false 
      }
    });

    if (!invitation) {
      throw new NotFoundException('Zaproszenie nie istnieje lub zostało już wykorzystane');
    }

    await this.invitationRepository.remove(invitation);

    this.logger.log(`Zaproszenie anulowane: ${invitationId} przez: ${cancelledBy}`);

    return { message: 'Zaproszenie zostało anulowane' };
  }

  /**
   * Pobiera listę aktywnych zaproszeń
   */
  async getActiveInvitations() {
    return this.invitationRepository.find({
      where: { 
        isAccepted: false,
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Sprawdza ważność zaproszenia
   */
  async validateInvitation(token: string) {
    const invitation = await this.invitationRepository.findOne({
      where: { 
        token,
        isAccepted: false 
      }
    });

    if (!invitation) {
      throw new NotFoundException('Zaproszenie nie istnieje lub zostało już wykorzystane');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Zaproszenie wygasło');
    }

    return {
      valid: true,
      email: invitation.email,
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      expiresAt: invitation.expiresAt,
    };
  }
}