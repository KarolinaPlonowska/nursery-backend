import { Injectable } from '@nestjs/common';
import { RegistrationService } from './services/registration.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';
import { LoginService } from './services/login.service';
import { AdminInvitationService } from './services/admin-invitation.service';

@Injectable()
export class AuthService {
  constructor(
    private registrationService: RegistrationService,
    private emailVerificationService: EmailVerificationService,
    private passwordResetService: PasswordResetService,
    private loginService: LoginService,
    private adminInvitationService: AdminInvitationService,
  ) {}

  // Delegowane metody do RegistrationService
  async register(
    email: string,
    password: string,
    role: 'ADMIN' | 'PARENT' | 'CAREGIVER',
    firstName?: string,
    lastName?: string,
  ) {
    return this.registrationService.register(email, password, role, firstName, lastName);
  }

  async createAdmin(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    inviteCode?: string,
  ) {
    return this.registrationService.createAdmin(email, password, firstName, lastName, inviteCode);
  }

  // Delegowane metody do EmailVerificationService
  async verifyEmail(email: string, code: string) {
    return this.emailVerificationService.verifyEmail(email, code);
  }

  async resendVerificationCode(email: string) {
    return this.emailVerificationService.resendVerificationCode(email);
  }

  // Delegowane metody do PasswordResetService
  async requestPasswordReset(email: string) {
    return this.passwordResetService.requestPasswordReset(email);
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    return this.passwordResetService.resetPassword(email, token, newPassword);
  }

  // Delegowane metody do LoginService
  async validateUser(email: string, password: string): Promise<any> {
    return this.loginService.validateUser(email, password);
  }

  async login(email: string, password: string) {
    return this.loginService.login(email, password);
  }

  async refreshAccessToken(refreshToken: string) {
    return this.loginService.refreshAccessToken(refreshToken);
  }

  async logLoginAttempt(email: string, ipAddress: string, success: boolean, failureReason?: string) {
    return this.loginService.logLoginAttempt(email, ipAddress, success, failureReason);
  }

  async clearRefreshToken(userId: string): Promise<void> {
    return this.loginService.clearRefreshToken(userId);
  }

  async updateRefreshToken(userId: string, refreshToken: string, expiresAt: Date): Promise<void> {
    return this.loginService.updateRefreshToken(userId, refreshToken, expiresAt);
  }

  // Delegowane metody do AdminInvitationService
  async inviteAdmin(email: string, firstName: string, lastName: string, invitedBy: string) {
    return this.adminInvitationService.sendInvitation(email, firstName, lastName, invitedBy);
  }

  async acceptAdminInvitation(token: string, password: string) {
    return this.adminInvitationService.acceptInvitation(token, password);
  }

  async validateAdminInvitation(token: string) {
    return this.adminInvitationService.validateInvitation(token);
  }

  async getActiveInvitations() {
    return this.adminInvitationService.getActiveInvitations();
  }

  async cancelInvitation(invitationId: string, cancelledBy: string) {
    return this.adminInvitationService.cancelInvitation(invitationId, cancelledBy);
  }
}
