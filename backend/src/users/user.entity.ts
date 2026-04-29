import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { OneToMany } from 'typeorm';
import { Child } from '../children/child.entity';
import { ManyToOne } from 'typeorm';
import { Group } from '../groups/group.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ type: 'enum', enum: ['ADMIN', 'PARENT', 'CAREGIVER'] })
  role: 'ADMIN' | 'PARENT' | 'CAREGIVER';

  @Column({ nullable: true })
  refreshToken?: string; // Refresh token (haszowany)
  @Column({ nullable: true })
  refreshTokenExpiresAt?: Date; // Ważny 7 dni

  @OneToMany(() => Child, (child) => child.parent)
  children: Child[];

  @ManyToOne(() => Group, (group) => group.users, { nullable: true })
  group: Group;

  @Column({ nullable: true })
  groupId: string;
}
