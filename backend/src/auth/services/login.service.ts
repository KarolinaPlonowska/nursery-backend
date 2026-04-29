import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { UsersService } from '../../users/users.service';
import { LoginAttempt } from '../entities/login-attempt.entity';
import { EmailService } from './email.service';
import { PasswordService } from './password.service';

@Injectable()
export class LoginService {
  private readonly logger = new Logger(LoginService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private passwordService: PasswordService,
    @InjectRepository(LoginAttempt)
    private loginAttemptRepository: Repository<LoginAttempt>,
  ) {}

  /**
   * Waliduje użytkownika podczas logowania
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await this.passwordService.comparePassword(password, user.password))) {
      this.logger.log(`Użytkownik ${user.id} pomyślnie uwierzytelniony`);
      const { password, ...result } = user;
      return result;
    }
    this.logger.warn(`Nieudana próba logowania: ${email}`);
    throw new UnauthorizedException('Invalid credentials');
  }

  /**
   * Loguje użytkownika i zwraca JWT token
   */
  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      this.logger.warn(`Nieudane logowanie – brak użytkownika: ${email}`);
      throw new UnauthorizedException('Nieprawidłowy email lub hasło');
    }

    const isPasswordValid = await this.passwordService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Nieudane logowanie – błędne hasło: ${email}`);
      throw new UnauthorizedException('Nieprawidłowy email lub hasło');
    }

    this.logger.log(`Użytkownik ${user.id} (${user.role}) zalogował się`);
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
      groupId: user.groupId,
    };
    return {
      access_token: this.jwtService.sign(payload),
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
   * Odświeża access token używając refresh tokenu
   */
  async refreshAccessToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token nie znaleziony');
    }

    // Znajdź użytkownika z tym refresh tokenem
    const user = await this.usersService.findByRefreshToken(refreshToken);
    
    if (!user || !user.refreshTokenExpiresAt || new Date() > user.refreshTokenExpiresAt) {
      throw new UnauthorizedException('Refresh token wygasł lub jest niewłaściwy');
    }

    // Generuj nowy access token
    const payload = { username: user.username, sub: user.id, role: user.role };
    const newAccessToken = this.jwtService.sign(payload);

    this.logger.log(`Access token odświeżony dla użytkownika: ${user.id}`);

    return {
      access_token: newAccessToken,
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
   * Czyści refresh token (wylogowanie)
   */
  async clearRefreshToken(userId: string): Promise<void> {
    await this.usersService.clearRefreshToken(userId);
  }

  /**
   * Aktualizuje refresh token użytkownika
   */
  async updateRefreshToken(userId: string, refreshToken: string, expiresAt: Date): Promise<void> {
    const hashedToken = await this.passwordService.hashPassword(refreshToken);
    await this.usersService.updateRefreshToken(userId, hashedToken, expiresAt);
  }

  /**
   * Loguje próbę logowania w systemie auditowym
   */
  async logLoginAttempt(email: string, ipAddress: string, success: boolean, failureReason?: string) {
    const attempt = this.loginAttemptRepository.create({
      email: email.toLowerCase().trim(),
      ipAddress,
      success,
      failureReason,
    });
    await this.loginAttemptRepository.save(attempt);

    // Jeśli udane logowanie, wyślij notyfikację
    if (success) {
      try {
        const user = await this.usersService.findByEmail(email);
        if (user) {
          // Sprawdź czy ostatnie logowanie było z innego IP
          const lastLogin = await this.loginAttemptRepository
            .createQueryBuilder('attempt')
            .where('attempt.email = :email', { email: email.toLowerCase().trim() })
            .andWhere('attempt.success = :success', { success: true })
            .orderBy('attempt.attemptedAt', 'DESC')
            .skip(1)
            .take(1)
            .getOne();

          if (lastLogin && lastLogin.ipAddress !== ipAddress) {
            await this.emailService.sendLoginNotification(
              email,
              user.firstName,
              ipAddress,
            );
          }
        }
      } catch (error) {
        this.logger.error('Błąd przy wysyłaniu notyfikacji logowania:', error);
        // Nie rzucaj błędu - logowanie zostało już zalogowane
      }
    }
  }

  /**
   * Generuje refresh token
   */
  private generateRefreshToken(): string {
    // 32 znakowy losowy token
    return crypto
      .randomBytes(32)
      .toString('hex');
  }
}