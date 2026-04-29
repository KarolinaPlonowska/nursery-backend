import { Injectable, Logger, ConflictException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../../users/users.service';
import { EmailVerification } from '../entities/email-verification.entity';
import { EmailService } from './email.service';
import { PasswordService } from './password.service';

@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);

  constructor(
    private usersService: UsersService,
    private emailService: EmailService,
    private passwordService: PasswordService,
    @InjectRepository(EmailVerification)
    private emailVerificationRepository: Repository<EmailVerification>,
  ) {}

  /**
   * Rejestruje nowego użytkownika i wysyła kod weryfikacyjny
   */
  async register(
    email: string,
    password: string,
    role: 'ADMIN' | 'PARENT' | 'CAREGIVER',
    firstName?: string,
    lastName?: string,
  ) {
    // Normalizuj email
    const normalizedEmail = email.toLowerCase().trim();

    // Walidacja siły hasła
    this.passwordService.validatePasswordStrength(password);

    // Sprawdź czy email już istnieje
    const existingUser = await this.usersService.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictException('Email jest już zarejestrowany');
    }

    // Sprawdź czy jest już oczekujący na weryfikację
    const existingVerification = await this.emailVerificationRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingVerification) {
      // Usuń stary rekord
      await this.emailVerificationRepository.remove(existingVerification);
    }

    // Wygeneruj kod weryfikacyjny
    const verificationCode = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minut

    // Zahaszuj hasło
    const hashedPassword = await this.passwordService.hashPassword(password);

    // Zapisz dane weryfikacyjne
    const verification = this.emailVerificationRepository.create({
      email: normalizedEmail,
      code: verificationCode,
      firstName,
      lastName,
      password: hashedPassword,
      role: role as 'PARENT' | 'CAREGIVER',
      expiresAt,
    });

    await this.emailVerificationRepository.save(verification);

    // Wyślij email z kodem
    await this.emailService.sendVerificationCode(
      normalizedEmail,
      verificationCode,
      firstName || email,
    );

    this.logger.log(`Email weryfikacyjny wysłany do: ${normalizedEmail}`);

    return {
      message: 'Kod weryfikacyjny został wysłany na Twój email',
      email: normalizedEmail,
    };
  }

  /**
   * Tworzy konto administratora
   */
  async createAdmin(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    inviteCode?: string,
  ) {
    // Normalizuj email
    const normalizedEmail = email.toLowerCase().trim();

    // Walidacja siły hasła
    this.passwordService.validatePasswordStrength(password);

    // Sprawdź czy email już istnieje
    const existingUser = await this.usersService.findByEmail(normalizedEmail);
    if (existingUser) {
      this.logger.warn(`Próba utworzenia admina z już zarejestrowanym emailem: ${normalizedEmail}`);
      throw new ConflictException('Email jest już zarejestrowany');
    }

    // Check if this is the first admin
    const adminCount = await this.usersService.countAdmins();
    
    if (adminCount === 0) {
      // First admin requires invite code
      const requiredCode = process.env.ADMIN_INVITE_CODE || 'FIRST_ADMIN_2025';
      if (!inviteCode || inviteCode !== requiredCode) {
        this.logger.warn(`Nieudana próba utworzenia pierwszego admina - błędny kod zaproszenia`);
        throw new BadRequestException('Invalid invite code for first admin');
      }
    }

    const hashedPassword = await this.passwordService.hashPassword(password);
    const user = await this.usersService.create({
      username: normalizedEmail,
      password: hashedPassword,
      email: normalizedEmail,
      role: 'ADMIN',
      firstName,
      lastName,
      emailVerified: true, // Admini są automatycznie weryfikowani
    });

    this.logger.log(`Utworzono konto administratora: ${user.id} (${user.email})`);
    return user;
  }

  /**
   * Generuje 6-cyfrowy kod weryfikacyjny
   */
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}