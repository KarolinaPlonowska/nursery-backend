import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../../users/users.service';
import { EmailVerification } from '../entities/email-verification.entity';
import { EmailService } from './email.service';

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    private usersService: UsersService,
    private emailService: EmailService,
    @InjectRepository(EmailVerification)
    private emailVerificationRepository: Repository<EmailVerification>,
  ) {}

  /**
   * Weryfikuje email używając kodu weryfikacyjnego
   */
  async verifyEmail(email: string, code: string) {
    const normalizedEmail = email.toLowerCase().trim();

    // Sprawdź weryfikację
    const verification = await this.emailVerificationRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (!verification) {
      throw new BadRequestException('Nie znaleziono oczekujące rejestracji');
    }

    if (verification.attempts >= 5) {
      await this.emailVerificationRepository.remove(verification);
      throw new BadRequestException(
        'Przekroczono liczbę prób. Spróbuj ponownie zarejestrować się.',
      );
    }

    if (new Date() > verification.expiresAt) {
      await this.emailVerificationRepository.remove(verification);
      throw new BadRequestException('Kod wygasł. Zarejestruj się ponownie.');
    }

    if (verification.code !== code) {
      verification.attempts += 1;
      await this.emailVerificationRepository.save(verification);
      throw new BadRequestException('Błędny kod weryfikacyjny');
    }

    // Kod jest poprawny - sprawdź czy użytkownik już istnieje
    const existingUser = await this.usersService.findByEmail(normalizedEmail);
    
    let user;
    if (existingUser) {
      // Zaktualizuj istniejącego użytkownika
      user = await this.usersService.verifyEmail(existingUser.id);
      this.logger.log(`Email zweryfikowany dla istniejącego użytkownika: ${user.id}`);
    } else {
      // Utwórz nowego użytkownika (rejestracja)
      user = await this.usersService.create({
        username: normalizedEmail,
        password: verification.password,
        email: normalizedEmail,
        role: verification.role as 'PARENT' | 'CAREGIVER',
        firstName: verification.firstName,
        lastName: verification.lastName,
        emailVerified: true,
      });
      this.logger.log(`Email zweryfikowany i użytkownik utworzony: ${user.id}`);
    }

    // Usuń rekord weryfikacji
    await this.emailVerificationRepository.remove(verification);

    return {
      message: 'Email zweryfikowany pomyślnie',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }

  /**
   * Ponownie wysyła kod weryfikacyjny
   */
  async resendVerificationCode(email: string) {
    const normalizedEmail = email.toLowerCase().trim();

    // Sprawdź czy użytkownik już istnieje
    const existingUser = await this.usersService.findByEmail(normalizedEmail);
    
    let verification = await this.emailVerificationRepository.findOne({
      where: { email: normalizedEmail },
    });

    // Jeśli użytkownik istnieje ale nie ma weryfikacji, utwórz nową
    if (existingUser && !verification) {
      // Admini nie potrzebują weryfikacji email - zweryfikuj od razu
      if (existingUser.role === 'ADMIN') {
        await this.usersService.verifyEmail(existingUser.id);
        return { message: 'Email administratora został zweryfikowany automatycznie' };
      }

      const newCode = this.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      
      verification = this.emailVerificationRepository.create({
        email: normalizedEmail,
        code: newCode,
        firstName: existingUser.firstName || 'Użytkownik',
        lastName: existingUser.lastName || '',
        role: existingUser.role as 'PARENT' | 'CAREGIVER',
        password: existingUser.password, // Już zahashowane
        expiresAt,
        attempts: 0,
      });
      
      await this.emailVerificationRepository.save(verification);
      
      await this.emailService.sendVerificationCode(
        normalizedEmail,
        newCode,
        existingUser.firstName || 'Użytkownik',
      );
      
      this.logger.log(`Nowy kod weryfikacyjny wysłany do istniejącego użytkownika: ${normalizedEmail}`);
      
      return { message: 'Kod weryfikacyjny wysłany na email' };
    }

    if (!verification) {
      throw new BadRequestException('Nie znaleziono oczekujące rejestracji');
    }

    if (new Date() > verification.expiresAt) {
      await this.emailVerificationRepository.remove(verification);
      throw new BadRequestException('Sesja wygasła. Zarejestruj się ponownie.');
    }

    // Wygeneruj nowy kod
    const newCode = this.generateVerificationCode();
    verification.code = newCode;
    verification.attempts = 0;
    verification.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await this.emailVerificationRepository.save(verification);

    // Wyślij nowy email
    await this.emailService.sendVerificationCode(
      normalizedEmail,
      newCode,
      verification.firstName,
    );

    this.logger.log(`Kod weryfikacyjny ponownie wysłany do: ${normalizedEmail}`);

    return { message: 'Nowy kod wysłany na email' };
  }

  /**
   * Generuje 6-cyfrowy kod weryfikacyjny
   */
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}