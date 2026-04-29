import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('login_attempts')
export class LoginAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  ipAddress: string;

  @Column()
  success: boolean; // true = udane logowanie, false = błędne

  @Column({ nullable: true })
  failureReason?: string; // Powód niepowodzenia (np. błędne hasło)

  @CreateDateColumn()
  attemptedAt: Date;
}
