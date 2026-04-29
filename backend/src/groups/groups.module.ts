import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group } from './group.entity';
import { Child } from '../children/child.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Group, Child, User])],
  providers: [GroupsService],
  controllers: [GroupsController],
  exports: [GroupsService], // Exporting the service for use in other modules
})
export class GroupsModule {}
