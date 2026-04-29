import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Group } from '../groups/group.entity';

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  authorId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'authorId' })
  author: User | null;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ 
    type: 'enum', 
    enum: ['NORMAL', 'URGENT'],
    default: 'NORMAL' 
  })
  priority: 'NORMAL' | 'URGENT';

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  groupId: string;

  @ManyToOne(() => Group, { nullable: true })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'announcement_views',
    joinColumn: { name: 'announcementId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' }
  })
  viewedBy: User[];
}
