import { Child } from '../children/child.entity';
import { User } from '../users/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => User, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'caregiverId' })
  caregiver: User | null;

  @Column({ nullable: true })
  caregiverId: string | null;

  @OneToMany(() => Child, (child) => child.group)
  children: Child[];

  @OneToMany(() => User, (user) => user.group)
  users: User[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
