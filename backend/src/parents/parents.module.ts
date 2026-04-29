import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentsService } from './parents.service';
import { ParentsController } from './parents.controller';
import { Parent } from './parent.entity';
import { Child } from '../children/child.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Parent, Child])],
  providers: [ParentsService],
  controllers: [ParentsController],
  exports: [ParentsService],
})
export class ParentsModule {}
