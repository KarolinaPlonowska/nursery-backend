import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { Group } from '../groups/group.entity';
import { Attendance } from '../attendance/attendance.entity';

@Entity('children')
export class Child {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  birthDate!: Date;

  @ManyToOne(() => User, (user) => user.children, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  parent?: User | null;

  @ManyToOne(() => Group, (group) => group.children, { nullable: true })
  group?: Group | null;

  @OneToMany(() => Attendance, (attendance) => attendance.child)
  attendances!: Attendance[];
}
