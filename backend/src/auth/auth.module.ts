import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthRateLimiterService } from './auth-rate-limiter.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerification } from './entities/email-verification.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { LoginAttempt } from './entities/login-attempt.entity';
import { AdminInvitation } from './entities/admin-invitation.entity';
import { EmailService } from './services/email.service';
import { PasswordService } from './services/password.service';
import { RegistrationService } from './services/registration.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';
import { LoginService } from './services/login.service';
import { AdminInvitationService } from './services/admin-invitation.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    TypeOrmModule.forFeature([EmailVerification, PasswordReset, LoginAttempt, AdminInvitation]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'development_secret_key_change_in_production',
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    AuthRateLimiterService,
    EmailService,
    PasswordService,
    RegistrationService,
    EmailVerificationService,
    PasswordResetService,
    LoginService,
    AdminInvitationService,
  ],
  exports: [AuthService, AuthRateLimiterService, EmailService],
  controllers: [AuthController],
})
export class AuthModule {}
