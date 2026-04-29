import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Ip,
  Res,
  Param,
  Delete,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { AuthRateLimiterService } from './auth-rate-limiter.service';
import * as crypto from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private rateLimiterService: AuthRateLimiterService,
  ) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Ochrona przed brute force - limit 5 prób na 5 minut
    await this.rateLimiterService.consume(ip);
    
    try {
      const result = await this.authService.login(body.email, body.password);
      
      // Resetuj rate limiter po udanym logowaniu
      await this.rateLimiterService.reset(ip);
      
      // Wygeneruj refresh token
      const refreshToken = crypto
        .randomBytes(32)
        .toString('hex');
      const refreshTokenExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dni
      
      try {
        await this.authService.updateRefreshToken(result.user.id, refreshToken, refreshTokenExpiration);
      } catch (refreshError) {
        console.error('Błąd przy aktualizacji refresh tokena:', refreshError);
        // Nie przeryway logowania jeśli update tokena nie powiedzie się
      }
      
      // Ustaw tokeny w httpOnly cookies
      res.cookie('access_token', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000, // 1 godzina
        path: '/',
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dni
        path: '/',
      });

      // Loguj udane logowanie
      try {
        await this.authService.logLoginAttempt(body.email, ip, true);
      } catch (logError) {
        console.error('Błąd przy logowaniu udanego logowania:', logError);
      }

      return {
        message: 'Zalogowany pomyślnie',
        user: result.user,
      };
    } catch (error) {
      // Loguj nieudane logowanie (nie rzucaj błędu jeśli logowanie się nie powiedzie)
      try {
        const message = error instanceof Error ? error.message : String(error);
        await this.authService.logLoginAttempt(body.email, ip, false, message);
      } catch (logError) {
        console.error('Błąd przy logowaniu próby logowania:', logError);
      }
      throw error;
    }
  }

  @Post('register')
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      role: 'PARENT' | 'CAREGIVER';
      firstName: string;
      lastName: string;
    },
    @Ip() ip: string,
  ) {
    // Ochrona przed spam'owaniem rejestracji - limit 5 prób na 5 minut
    await this.rateLimiterService.consume(`register-${ip}`);
    return this.authService.register(
      body.email,
      body.password,
      body.role,
      body.firstName,
      body.lastName,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('invite-admin')
  async inviteAdmin(
    @Request() req,
    @Body()
    body: {
      email: string;
      firstName: string;
      lastName: string;
    },
  ) {
    console.log('Invite admin request received:', body);
    console.log('User from JWT:', req.user);
    console.log('Cookies:', req.cookies);
    return this.authService.inviteAdmin(
      body.email,
      body.firstName,
      body.lastName,
      req.user.id,
    );
  }

  @Post('accept-admin-invitation')
  async acceptAdminInvitation(
    @Body()
    body: {
      token: string;
      password: string;
    },
  ) {
    return this.authService.acceptAdminInvitation(body.token, body.password);
  }

  @Get('validate-admin-invitation/:token')
  async validateAdminInvitation(@Param('token') token: string) {
    return this.authService.validateAdminInvitation(token);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin-invitations')
  async getActiveInvitations() {
    return this.authService.getActiveInvitations();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('admin-invitations/:id')
  async cancelInvitation(@Request() req, @Param('id') invitationId: string) {
    return this.authService.cancelInvitation(invitationId, req.user.id);
  }

  // Zachowujemy stary endpoint dla kompatybilności (tworzenie pierwszego admina)
  @Post('create-admin')
  async createAdmin(
    @Body()
    body: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      inviteCode?: string;
    },
  ) {
    return this.authService.createAdmin(
      body.email,
      body.password,
      body.firstName,
      body.lastName,
      body.inviteCode,
    );
  }

  @Post('verify-email')
  async verifyEmail(
    @Body() body: { email: string; code: string },
  ) {
    return this.authService.verifyEmail(body.email, body.code);
  }

  @Post('resend-verification-code')
  async resendVerificationCode(
    @Body() body: { email: string },
  ) {
    return this.authService.resendVerificationCode(body.email);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response, @Request() req) {
    // Usuń cookies
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    
    // Wyczyść refresh token z bazy
    if (req.user) {
      await this.authService.clearRefreshToken(req.user.id);
    }
    
    return { message: 'Wylogowany pomyślnie' };
  }

  @Post('refresh-token')
  async refreshToken(
    @Body() body: { refresh_token?: string },
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    // Spróbuj czytać refresh_token z cookies lub body
    const refreshToken = body?.refresh_token || req?.cookies?.refresh_token;
    
    if (!refreshToken) {
      throw new Error('Brak refresh token');
    }
    
    const result = await this.authService.refreshAccessToken(refreshToken);
    
    // Ustaw nowy access token
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
      path: '/',
    });

    return {
      message: 'Access token odświeżony',
      user: result.user,
    };
  }

  @Post('request-password-reset')
  async requestPasswordReset(
    @Body() body: { email: string },
  ) {
    return this.authService.requestPasswordReset(body.email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() body: { email: string; token: string; newPassword: string },
  ) {
    return this.authService.resetPassword(body.email, body.token, body.newPassword);
  }

  @UseGuards(JwtAuthGuard) // Ochrona endpointu JWT
  @Get('profile')
  getProfile(@Request() req) {
    return req.user; // Zwraca dane użytkownika z tokena
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin')
  getAdminEndpoint() {
    return { message: 'Witaj Adminie!' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PARENT')
  @Get('parent')
  getParentEndpoint() {
    return { message: 'Witaj Rodzicu!' };
  }
}
