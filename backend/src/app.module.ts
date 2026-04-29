import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChildrenModule } from './children/children.module';
import { CaregiversModule } from './caregivers/caregivers.module';
import { ParentsModule } from './parents/parents.module';
import { GroupsModule } from './groups/groups.module';
import { AttendanceModule } from './attendance/attendance.module';
import { MessagesModule } from './messages/messages.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { User } from './users/user.entity';
import { Child } from './children/child.entity';
import { Attendance } from './attendance/attendance.entity';
import { Caregiver } from './caregivers/caregiver.entity';
import { Parent } from './parents/parent.entity';
import { Group } from './groups/group.entity';
import { EmailVerification } from './auth/entities/email-verification.entity';
import { PasswordReset } from './auth/entities/password-reset.entity';
import { LoginAttempt } from './auth/entities/login-attempt.entity';
import { AdminInvitation } from './auth/entities/admin-invitation.entity';
import { Message } from './messages/message.entity';
import { Announcement } from './announcements/announcement.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'nursery_db',
      entities: [
        User, 
        Child, 
        Group, 
        Caregiver, 
        Parent, 
        Attendance, 
        EmailVerification, 
        PasswordReset, 
        LoginAttempt,
        AdminInvitation,
        Message,
        Announcement
      ],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    ChildrenModule,
    CaregiversModule,
    ParentsModule,
    GroupsModule,
    AttendanceModule,
    MessagesModule,
    AnnouncementsModule,
  ],
})
export class AppModule {}
