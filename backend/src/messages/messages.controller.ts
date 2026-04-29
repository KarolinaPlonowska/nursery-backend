import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MessagesService } from './messages.service';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async sendMessage(
    @Request() req,
    @Body() body: { receiverId: string; content: string },
  ) {
    return this.messagesService.sendMessage(
      req.user.id,
      body.receiverId,
      body.content,
    );
  }

  @Get('conversations')
  async getConversations(@Request() req) {
    return this.messagesService.getConversations(req.user.id);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.messagesService.getUnreadCount(req.user.id);
    return { count };
  }

  @Get('available-users')
  async getAvailableUsers(@Request() req) {
    return this.messagesService.getAvailableUsers(req.user.id);
  }

  @Get('conversation/:userId')
  async getConversation(@Request() req, @Param('userId') otherUserId: string) {
    return this.messagesService.getConversation(req.user.id, otherUserId);
  }

  @Patch(':id/read')
  async markAsRead(@Request() req, @Param('id') messageId: string) {
    await this.messagesService.markAsRead(messageId, req.user.id);
    return { message: 'Oznaczono jako przeczytane' };
  }
}
