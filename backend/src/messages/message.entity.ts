import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  senderId: string;

  @ManyToOne(() => User)
  sender: User;

  @Column()
  receiverId: string;

  @ManyToOne(() => User)
  receiver: User;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  readAt: Date;
}
