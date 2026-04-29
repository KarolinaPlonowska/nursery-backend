import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { Group } from './group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AssignCaregiverDto } from './dto/assign-caregiver.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CAREGIVER')
  @Get()
  async findAll(): Promise<Group[]> {
    return this.groupsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async create(@Body() createGroupDto: CreateGroupDto): Promise<Group> {
    return this.groupsService.create(createGroupDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    return this.groupsService.update(id, updateGroupDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post(':id/assign-child')
  async assignChild(
    @Param('id') id: string,
    @Body() body: { childId: string },
  ): Promise<Group> {
    return this.groupsService.assignChild(id, body.childId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post(':id/assign-caregiver')
  async assignCaregiver(
    @Param('id') id: string,
    @Body() body: AssignCaregiverDto,
  ): Promise<Group> {
    return this.groupsService.assignCaregiver(id, body.caregiverId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id/remove-caregiver')
  async removeCaregiver(@Param('id') id: string): Promise<Group> {
    return this.groupsService.removeCaregiver(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CAREGIVER')
  @Get('my-groups')
  async getMyGroups(@Request() req): Promise<Group[]> {
    return this.groupsService.findGroupsByCaregiver(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.groupsService.delete(id);
    return { message: 'Grupa usunięta' };
  }
}
