import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('password_resets')
export class PasswordReset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  token: string; // Hash tokenu reset

  @Column()
  expiresAt: Date; // Ważny 1 godzinę

  @Column({ default: false })
  used: boolean; // Czy już użyty

  @CreateDateColumn()
  createdAt: Date;
}
