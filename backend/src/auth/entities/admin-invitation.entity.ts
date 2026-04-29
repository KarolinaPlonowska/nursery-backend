import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('admin_invitations')
export class AdminInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  token: string; // Unikalny token do weryfikacji zaproszenia

  @Column()
  invitedBy: string; // ID admina który wysłał zaproszenie

  @Column({ default: false })
  isAccepted: boolean;

  @Column({ type: 'timestamp' })
  expiresAt: Date; // Data wygaśnięcia zaproszenia

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}