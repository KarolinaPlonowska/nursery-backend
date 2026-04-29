import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnnouncementsService } from './announcements.service';

@Controller('announcements')
@UseGuards(JwtAuthGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  async create(@Request() req, @Body() body: {
    title: string;
    content: string;
    priority: 'NORMAL' | 'URGENT';
    groupId?: string;
  }) {
    // Tylko admin i opiekun mogą tworzyć ogłoszenia
    if (req.user.role !== 'ADMIN' && req.user.role !== 'CAREGIVER') {
      throw new ForbiddenException('Nie masz uprawnień do tworzenia ogłoszeń');
    }

    return this.announcementsService.create(
      req.user.id,
      body.title,
      body.content,
      body.priority,
      body.groupId,
    );
  }

  @Get()
  async findAll(@Request() req) {
    return this.announcementsService.findAll(req.user.role, req.user.groupId);
  }

  @Get('unviewed/count')
  async getUnviewedCount(@Request() req) {
    const count = await this.announcementsService.getUnviewedCount(
      req.user.id,
      req.user.role,
      req.user.groupId,
    );
    return { count };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(id);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    await this.announcementsService.delete(id, req.user.id, req.user.role);
    return { message: 'Ogłoszenie usunięte' };
  }

  @Patch(':id/view')
  async markAsViewed(@Request() req, @Param('id') id: string) {
    await this.announcementsService.markAsViewed(id, req.user.id);
    return { message: 'Oznaczono jako przeczytane' };
  }
}
