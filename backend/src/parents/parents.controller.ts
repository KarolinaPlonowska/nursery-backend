import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ParentsService } from './parents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Child } from '../children/child.entity';
import { Inject } from '@nestjs/common';

@Controller('parents')
export class ParentsController {
  constructor(
    private readonly parentsService: ParentsService,
    @InjectRepository(Child)
    private readonly childrenRepository: Repository<Child>,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PARENT')
  @Get('children')
  async getMyChildren(@Request() req) {
    // Pobierz dzieci tylko dla zalogowanego rodzica
    return this.childrenRepository.find({
      where: { parent: { id: req.user.id } },
      relations: ['group'],
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }
}
