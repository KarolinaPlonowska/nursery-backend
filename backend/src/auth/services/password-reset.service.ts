import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../../users/users.service';
import { PasswordReset } from '../entities/password-reset.entity';
import { EmailService } from './email.service';
import { PasswordService } from './password.service';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    private usersService: UsersService,
    private emailService: EmailService,
    private passwordService: PasswordService,
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
  ) {}

  /**
   * Wysyła żądanie resetowania hasła
   */
  async requestPasswordReset(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (!user) {
      // Nie zdradź czy email istnieje
      this.logger.warn(`Password reset request dla nieistniejącego emaila: ${normalizedEmail}`);
      return { message: 'Jeśli email istnieje, wysłaliśmy kod do resetowania hasła' };
    }

    // Usuń stare requesty
    await this.passwordResetRepository.delete({ email: normalizedEmail, used: false });

    // Wygeneruj 6-cyfrowy kod
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenHash = await this.passwordService.hashPassword(code);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minut

    const reset = this.passwordResetRepository.create({
      email: normalizedEmail,
      token: tokenHash,
      expiresAt,
    });
    await this.passwordResetRepository.save(reset);

    // Wyślij email z kodem resetowania
    await this.emailService.sendPasswordResetCode(normalizedEmail, code, user.firstName);

    this.logger.log(`Password reset kod wysłany do: ${normalizedEmail}`);
    return { message: 'Jeśli email istnieje, wysłaliśmy kod do resetowania hasła' };
  }

  /**
   * Resetuje hasło używając kodu resetowania
   */
  async resetPassword(email: string, token: string, newPassword: string) {
    const normalizedEmail = email.toLowerCase().trim();

    // Walidacja siły hasła
    this.passwordService.validatePasswordStrength(newPassword);

    // Znajdź request resetowania
    const reset = await this.passwordResetRepository.findOne({
      where: { email: normalizedEmail, used: false },
    });

    if (!reset) {
      throw new BadRequestException('Link resetowania jest niewłaściwy lub wygasł');
    }

    if (new Date() > reset.expiresAt) {
      await this.passwordResetRepository.remove(reset);
      throw new BadRequestException('Link resetowania wygasł');
    }

    // Weryfikuj token
    const isValidToken = await this.passwordService.comparePassword(token, reset.token);
    if (!isValidToken) {
      throw new BadRequestException('Link resetowania jest niewłaściwy');
    }

    // Zaktualizuj hasło
    const hashedPassword = await this.passwordService.hashPassword(newPassword);
    const user = await this.usersService.findByEmail(normalizedEmail);
    
    if (!user) {
      throw new BadRequestException('Użytkownik nie znaleziony');
    }

    await this.usersService.updatePassword(user.id, hashedPassword);

    // Oznacz request jako użyty
    reset.used = true;
    await this.passwordResetRepository.save(reset);

    // Wyślij potwierdzenie
    await this.emailService.sendPasswordResetConfirmation(normalizedEmail, user.firstName);

    this.logger.log(`Hasło resetowane dla użytkownika: ${user.id}`);
    return { message: 'Hasło zostało zmienione pomyślnie' };
  }
}