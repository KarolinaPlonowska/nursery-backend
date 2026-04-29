import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private usersService: UsersService,
  ) {}

  async sendMessage(senderId: string, receiverId: string, content: string): Promise<Message> {
    // Sprawdź czy użytkownicy istnieją
    const sender = await this.usersService.findOne(senderId);
    const receiver = await this.usersService.findOne(receiverId);

    // Sprawdź uprawnienia - rodzice mogą pisać do opiekunów swojej grupy
    if (sender.role === 'PARENT') {
      if (receiver.role === 'CAREGIVER' && receiver.groupId === sender.groupId) {
        // OK - opiekun z grupy
      } else if (receiver.role === 'ADMIN') {
        // Sprawdź czy admin wcześniej napisał do rodzica
        const existingMessages = await this.messagesRepository.findOne({
          where: { senderId: receiverId, receiverId: senderId }
        });
        
        if (!existingMessages) {
          throw new ForbiddenException('Możesz odpowiedzieć administratorowi tylko jeśli wcześniej do Ciebie napisał');
        }
      } else {
        throw new ForbiddenException('Możesz pisać tylko do opiekunów swojej grupy');
      }
    }

    // Opiekunowie mogą pisać do rodziców swojej grupy i adminów
    if (sender.role === 'CAREGIVER') {
      const canSend = 
        receiver.role === 'ADMIN' ||
        (receiver.role === 'PARENT' && receiver.groupId === sender.groupId) ||
        (receiver.role === 'CAREGIVER' && receiver.groupId === sender.groupId);
      
      if (!canSend) {
        throw new ForbiddenException('Możesz pisać tylko do rodziców i opiekunów swojej grupy oraz administratorów');
      }
    }

    const message = this.messagesRepository.create({
      senderId,
      receiverId,
      content,
    });

    return this.messagesRepository.save(message);
  }

  async getConversation(userId: string, otherUserId: string): Promise<Message[]> {
    return this.messagesRepository.find({
      where: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
      order: { createdAt: 'ASC' },
      relations: ['sender', 'receiver'],
    });
  }

  async getConversations(userId: string): Promise<any[]> {
    // Pobierz wszystkie wiadomości użytkownika
    const messages = await this.messagesRepository
      .createQueryBuilder('message')
      .where('message.senderId = :userId OR message.receiverId = :userId', { userId })
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .orderBy('message.createdAt', 'DESC')
      .getMany();

    // Grupuj po rozmówcach
    const conversationsMap = new Map();
    
    for (const msg of messages) {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      
      if (!conversationsMap.has(otherUserId)) {
        const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          role: otherUser.role,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
        });
      }
      
      // Policz nieprzeczytane
      if (msg.receiverId === userId && !msg.readAt) {
        const conv = conversationsMap.get(otherUserId);
        conv.unreadCount++;
      }
    }

    return Array.from(conversationsMap.values());
  }

  async markAsRead(messageId: string, userId: string): Promise<void> {
    const message = await this.messagesRepository.findOne({ where: { id: messageId } });
    
    if (!message) {
      throw new NotFoundException('Wiadomość nie znaleziona');
    }

    if (message.receiverId !== userId) {
      throw new ForbiddenException('Nie możesz oznaczyć tej wiadomości jako przeczytaną');
    }

    message.readAt = new Date();
    await this.messagesRepository.save(message);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messagesRepository
      .createQueryBuilder('message')
      .where('message.receiverId = :userId', { userId })
      .andWhere('message.readAt IS NULL')
      .getCount();
  }

  async getAvailableUsers(userId: string): Promise<any[]> {
    const currentUser = await this.usersService.findOne(userId);
    
    let availableUsers: any[] = [];

    if (currentUser.role === 'ADMIN') {
      // Admin może pisać do wszystkich
      const users = await this.usersService.findAll();
      availableUsers = users.filter(u => u.id !== userId);
    } else if (currentUser.role === 'PARENT') {
      // Rodzic może pisać tylko do opiekunów swojej grupy
      const users = await this.usersService.findAll();
      availableUsers = users.filter(u => 
        u.role === 'CAREGIVER' && u.groupId === currentUser.groupId
      );
    } else if (currentUser.role === 'CAREGIVER') {
      // Opiekun może pisać do rodziców i innych opiekunów swojej grupy oraz do adminów
      const users = await this.usersService.findAll();
      availableUsers = users.filter(u => 
        u.id !== userId && (
          u.role === 'ADMIN' ||
          (u.role === 'PARENT' && u.groupId === currentUser.groupId) ||
          (u.role === 'CAREGIVER' && u.groupId === currentUser.groupId)
        )
      );
    }

    return availableUsers.map(u => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      email: u.email,
    }));
  }
}
