// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EmailService } from '../auth/services/email.service';
import { Message } from '../messages/message.entity';
import { Announcement } from '../announcements/announcement.entity';
import { Group } from '../groups/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Message, Announcement, Group])],
  providers: [UsersService, EmailService],
  controllers: [UsersController],
  exports: [UsersService], // Eksportowanie serwisu
})
export class UsersModule {}
