import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Child } from '../children/child.entity';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Child, (child) => child.attendances, { eager: true })
  child: Child;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar', length: 20 })
  status: string; // np. 'present', 'absent', 'sick'

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;
}
