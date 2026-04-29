import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Attendance } from './attendance.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { Child } from '../children/child.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, Child]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
