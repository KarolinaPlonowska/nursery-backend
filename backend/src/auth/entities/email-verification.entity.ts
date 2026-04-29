import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class EmailVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  code: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  password: string; // zahaszowane hasło

  @Column()
  role: 'PARENT' | 'CAREGIVER';

  @Column()
  expiresAt: Date;

  @Column({ default: 0 })
  attempts: number; // liczba prób weryfikacji

  @CreateDateColumn()
  createdAt: Date;
}
