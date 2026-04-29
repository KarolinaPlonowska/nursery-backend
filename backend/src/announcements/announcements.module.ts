import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Announcement } from './announcement.entity';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';
import { UsersModule } from '../users/users.module';
import { Group } from '../groups/group.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Announcement, Group]),
    UsersModule,
    AuthModule,
  ],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
  exports: [AnnouncementsService],
})
export class AnnouncementsModule {}
