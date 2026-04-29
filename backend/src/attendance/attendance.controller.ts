import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Logger } from '@nestjs/common';

@Controller('attendance')
export class AttendanceController {
  private readonly logger = new Logger(AttendanceController.name);

  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.create(dto);
  }

  @Get(':childId')
  @UseGuards(AuthGuard('jwt'))
  findByChild(@Param('childId') childId: string, @Req() req: any) {
    this.logger.log(
      `Fetching attendance for child ${childId} by user ${req.user?.id}`,
    );
    return this.attendanceService.findByChild(childId, req.user);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body('status') status: string) {
    return this.attendanceService.updateStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }
}
