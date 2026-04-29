import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  /**
   * Waliduje siłę hasła zgodnie z wymaganiami bezpieczeństwa
   */
  validatePasswordStrength(password: string): void {
    const minLength = 12;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password);

    if (password.length < minLength) {
      throw new BadRequestException(
        `Hasło musi mieć co najmniej ${minLength} znaków. Aktualna długość: ${password.length}.`,
      );
    }

    const requirements = [
      { met: hasUppercase, message: 'wielka litera (A-Z)' },
      { met: hasLowercase, message: 'mała litera (a-z)' },
      { met: hasNumber, message: 'cyfra (0-9)' },
      { met: hasSpecialChar, message: 'znak specjalny (!@#$%^&* itd.)' },
    ];

    const metCount = requirements.filter(req => req.met).length;
    if (metCount < 4) {
      const unmetRequirements = requirements
        .filter(req => !req.met)
        .map(req => req.message)
        .join(', ');
      throw new BadRequestException(
        `Hasło musi zawierać: ${unmetRequirements}.`,
      );
    }
  }

  /**
   * Haszuje hasło używając bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Porównuje hasło z hashem
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}