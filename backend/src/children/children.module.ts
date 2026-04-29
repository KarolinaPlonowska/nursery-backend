import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { Child } from './child.entity';
import { User } from '../users/user.entity';
import { Group } from '../groups/group.entity';
import { Attendance } from '../attendance/attendance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Child, User, Group, Attendance])],
  providers: [ChildrenService],
  controllers: [ChildrenController],
})
export class ChildrenModule {}
