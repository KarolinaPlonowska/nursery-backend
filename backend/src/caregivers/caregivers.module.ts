import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaregiversService } from './caregivers.service';
import { CaregiversController } from './caregivers.controller';
import { Caregiver } from './caregiver.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Caregiver])],
  providers: [CaregiversService],
  controllers: [CaregiversController],
  exports: [CaregiversService], // Exporting the service for use in other modules
})
export class CaregiversModule {}
