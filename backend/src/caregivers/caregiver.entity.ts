import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('caregivers')
export class Caregiver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  specialization: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
