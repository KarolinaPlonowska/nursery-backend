import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true' || false, // true dla 465, false dla innych
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production', // W dev akceptuj self-signed certificates
      },
    });

    // Log konfiguracji SMTP (bez hasła)
    console.log('📧 Email Service Configuration:');
    console.log('  Host:', process.env.SMTP_HOST || 'smtp.gmail.com');
    console.log('  Port:', process.env.SMTP_PORT || '587');
    console.log('  User:', process.env.SMTP_USER || 'NOT SET');
    console.log('  Secure:', process.env.SMTP_SECURE === 'true');
  }

  async sendVerificationCode(
    email: string,
    code: string,
    firstName: string,
  ): Promise<void> {
    const displayName = firstName || 'Użytkowniku';
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: '🔐 Kod weryfikacyjny - Żłobek Online',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5B21B6;">Witaj ${displayName}!</h2>
          <p>Dziękujemy za rejestrację w Żłobku Online.</p>
          
          <div style="background-color: #f3e8ff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="font-size: 14px; color: #666; margin: 0;">Twój kod weryfikacyjny:</p>
            <p style="font-size: 32px; font-weight: bold; color: #7C3AED; letter-spacing: 3px; margin: 10px 0;">${code}</p>
            <p style="font-size: 12px; color: #999; margin: 10px 0;">Kod ważny przez 15 minut</p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Jeśli nie rejestrowałaś się w Żłobku Online, zignoruj ten email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Żłobek Online - System zarządzania żłobkami
          </p>
        </div>
      `,
    };

    try {
      console.log(`📤 Wysyłanie kodu weryfikacyjnego do: ${email}`);
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email wysłany pomyślnie:', info.messageId);
      console.log('   Preview URL:', nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.error('❌ Błąd wysyłania emaila:', error);
      throw error;
    }
  }

  async sendPasswordResetCode(email: string, code: string, firstName: string): Promise<void> {
    const displayName = firstName || 'Użytkowniku';
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: '🔄 Resetowanie hasła - Żłobek Online',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5B21B6;">Resetowanie hasła</h2>
          <p>Cześć ${displayName}!</p>
          <p>Otrzymaliśmy prośbę o zmianę hasła do Twojego konta.</p>
          
          <div style="background-color: #f3e8ff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="font-size: 14px; color: #666; margin: 0;">Twój kod resetowania hasła:</p>
            <p style="font-size: 32px; font-weight: bold; color: #7C3AED; letter-spacing: 3px; margin: 10px 0;">${code}</p>
            <p style="font-size: 12px; color: #999; margin: 10px 0;">Kod ważny przez 15 minut</p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Jeśli nie prosiłeś o reset hasła, zignoruj ten email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Żłobek Online - System zarządzania żłobkami
          </p>
        </div>
      `,
    };

    try {
      console.log(`📤 Wysyłanie kodu resetowania hasła do: ${email}`);
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email z kodem resetowania wysłany pomyślnie:', info.messageId);
      console.log('   Preview URL:', nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.error('❌ Błąd wysyłania emaila:', error);
      throw error;
    }
  }

  async sendPasswordResetConfirmation(
    email: string,
    firstName: string,
  ): Promise<void> {
    const displayName = firstName || 'Użytkowniku';
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: '✅ Hasło zmienione - Żłobek Online',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5B21B6;">Hasło zmienione pomyślnie</h2>
          <p>Cześć ${displayName},</p>
          
          <p style="color: #666;">Twoje hasło zostało zmienione pomyślnie. Jeśli nie robiłeś tego, natychmiast skontaktuj się z nami.</p>
          
          <div style="background-color: #dbeafe; padding: 15px; border-left: 4px solid #0284c7; margin: 20px 0;">
            <p style="color: #0369a1; margin: 0;">
              ⚠️ Jeśli nie prosiłeś o zmianę hasła, kliknij <a href="${process.env.FRONTEND_URL}/contact-support" style="color: #0284c7; text-decoration: underline;">tutaj</a> aby powiadomić nas.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Żłobek Online - System zarządzania żłobkami
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  async sendLoginNotification(
    email: string,
    firstName: string,
    ipAddress: string,
  ): Promise<void> {
    const displayName = firstName || 'Użytkowniku';
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Nowe logowanie - Żłobek Online',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5B21B6;">Nowe logowanie do Twojego konta</h2>
          <p>Cześć ${displayName},</p>
          
          <p style="color: #666;">Właśnie zalogowano się na Twoje konto z nowego urządzenia lub lokalizacji.</p>
          
          <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="color: #92400e; margin: 0;"><strong>Szczegóły logowania:</strong></p>
            <p style="color: #92400e; margin: 5px 0;">IP: ${ipAddress}</p>
            <p style="color: #92400e; margin: 5px 0;">Czas: ${new Date().toLocaleString('pl-PL')}</p>
          </div>

          <p style="color: #666; font-size: 14px;">
            Jeśli to nie byłeś Ty, <a href="${process.env.FRONTEND_URL}/secure-account" style="color: #7C3AED; text-decoration: underline;">zabezpiecz swoje konto</a>.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Żłobek Online - System zarządzania żłobkami
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  async sendPasswordChangeNotification(
    email: string,
    firstName: string,
  ): Promise<void> {
    const displayName = firstName || 'Użytkowniku';
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Powiadomienie o zmianie hasła - Żłobek Online',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #EF4444;">Witaj ${displayName}!</h2>
          <p>Informujemy, że hasło do Twojego konta w Żłobku Online zostało właśnie zmienione.</p>
          
          <div style="background-color: #FEF2F2; padding: 20px; border-radius: 8px; border-left: 4px solid #EF4444; margin: 20px 0;">
            <p style="font-size: 14px; color: #991B1B; margin: 0; font-weight: 600;">
              <strong>Ważne:</strong>
            </p>
            <p style="font-size: 14px; color: #7F1D1D; margin: 10px 0 0 0;">
              Jeśli to nie byłaś Ty, natychmiast skontaktuj się z administratorem systemu.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Data i czas zmiany: <strong>${new Date().toLocaleString('pl-PL')}</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
          
          <p style="color: #999; font-size: 12px;">
            To jest automatyczna wiadomość. Prosimy nie odpowiadać na tego maila.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  async sendAnnouncementNotification(
    email: string,
    firstName: string,
    announcementTitle: string,
    announcementContent: string,
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT',
    authorName: string,
    groupName?: string,
  ): Promise<void> {
    const displayName = firstName || 'Użytkowniku';
    
    const priorityColors = {
      LOW: { color: '#10B981', label: 'Niski' },
      NORMAL: { color: '#3B82F6', label: 'Normalny' },
      HIGH: { color: '#F59E0B', label: 'Wysoki' },
      URGENT: { color: '#EF4444', label: 'Pilne' },
    };
    
    const priorityInfo = priorityColors[priority];
    const groupInfo = groupName ? `<p style="font-size: 14px; color: #7C3AED;">Grupa: <strong>${groupName}</strong></p>` : '';
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `Nowe ogłoszenie - ${announcementTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7C3AED;">Nowe ogłoszenie w Żłobku Online</h2>
          <p>Cześć ${displayName}!</p>
          <p>Mamy dla Ciebie nowe ogłoszenie:</p>
          
          <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; border-left: 4px solid ${priorityInfo.color}; margin: 20px 0;">
            <div style="margin-bottom: 10px;">
              <span style="background-color: ${priorityInfo.color}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                ${priorityInfo.label}
              </span>
            </div>
            
            <h3 style="color: #111827; margin: 15px 0 10px 0;">${announcementTitle}</h3>
            <p style="color: #4B5563; font-size: 14px; line-height: 1.6; margin: 10px 0;">
              ${announcementContent}
            </p>
            
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 15px 0;">
            
            <p style="font-size: 12px; color: #6B7280; margin: 5px 0;">
              Autor: <strong>${authorName}</strong>
            </p>
            ${groupInfo}
            <p style="font-size: 12px; color: #9CA3AF; margin: 5px 0;">
              Data: ${new Date().toLocaleString('pl-PL')}
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Zaloguj się do systemu, aby zobaczyć szczegóły.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Żłobek Online - System zarządzania żłobkami
          </p>
        </div>
      `,
    };

    try {
      console.log(`Wysyłanie powiadomienia o ogłoszeniu do: ${email}`);
      await this.transporter.sendMail(mailOptions);
      console.log(`Powiadomienie wysłane do: ${email}`);
    } catch (error) {
      console.error(`Błąd wysyłania powiadomienia do ${email}:`, error);
      // Nie rzucamy błędu - wysyłanie emaili nie powinno blokować tworzenia ogłoszenia
    }
  }

  async sendAdminInvitation(
    email: string,
    firstName: string,
    token: string,
  ): Promise<void> {
    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin-invitation/${token}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Zaproszenie do administracji - Żłobek Online',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5B21B6;">Witaj ${firstName}!</h2>
          <p>Zostałeś zaproszony do zostania administratorem w systemie <strong>Żłobek Online</strong>.</p>
          
          <div style="background-color: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #7C3AED; margin-top: 0;">Co to oznacza?</h3>
            <p style="margin: 10px 0;">Jako administrator będziesz mieć pełny dostęp do systemu zarządzania żłobkiem:</p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Zarządzanie użytkownikami (rodzice, opiekunowie)</li>
              <li>Organizowanie grup i dzieci</li>
              <li>Kontrola obecności</li>
              <li>Komunikacja z rodzicami</li>
              <li>Tworzenie ogłoszeń</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; box-shadow: 0 4px 12px rgba(251,191,36,0.4);">
              Zaakceptuj zaproszenie
            </a>
          </div>

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>Ważne:</strong> Ten link jest ważny przez 7 dni. Po tym czasie zaproszenie wygaśnie.
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              Jeśli nie spodziewałeś się tego zaproszenia, zignoruj tę wiadomość.
            </p>
          </div>

          <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
            Żłobek Online - System zarządzania żłobkami
          </p>
        </div>
      `,
    };

    try {
      console.log(`Wysyłanie zaproszenia administratora do: ${email}`);
      await this.transporter.sendMail(mailOptions);
      console.log(`Zaproszenie wysłane do: ${email}`);
    } catch (error) {
      console.error(`Błąd wysyłania zaproszenia do ${email}:`, error);
      throw new Error(`Failed to send admin invitation email to ${email}`);
    }
  }
}
