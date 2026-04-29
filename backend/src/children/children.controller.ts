import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { ChildrenService } from './children.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateChildDto } from './dto/create-child.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async create(@Body() createChildDto: CreateChildDto, @Request() req) {
    return this.childrenService.create(createChildDto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CAREGIVER')
  @Get()
  async findAll() {
    return this.childrenService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.childrenService.deleteChild(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/group')
  async updateGroup(
    @Param('id') id: string,
    @Body() body: { groupId?: string | null },
  ) {
    return this.childrenService.updateChildGroup(id, body.groupId ?? null);
  }
}
