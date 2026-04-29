import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './announcement.entity';
import { UsersService } from '../users/users.service';
import { Group } from '../groups/group.entity';
import { EmailService } from '../auth/services/email.service';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private announcementsRepository: Repository<Announcement>,
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  async create(
    authorId: string,
    title: string,
    content: string,
    priority: 'NORMAL' | 'URGENT',
    groupId?: string,
  ): Promise<Announcement> {
    const announcement = this.announcementsRepository.create({
      authorId,
      title,
      content,
      priority,
      groupId: groupId || undefined,
    });

    const savedAnnouncement = await this.announcementsRepository.save(announcement);
    
    // Wyślij powiadomienia email w tle (nie czekaj na zakończenie)
    this.sendAnnouncementNotifications(savedAnnouncement, authorId, groupId).catch(err => {
      console.error('Błąd wysyłania powiadomień email:', err);
    });

    return savedAnnouncement;
  }

  private async sendAnnouncementNotifications(
    announcement: Announcement,
    authorId: string,
    groupId?: string,
  ): Promise<void> {
    try {
      // Pobierz autora
      const author = await this.usersService.findOne(authorId);
      const authorName = `${author.firstName} ${author.lastName}`;
      
      // Pobierz użytkowników do powiadomienia
      let recipients: any[] = [];
      let groupName: string | undefined;
      
      if (groupId) {
        // Ogłoszenie dla konkretnej grupy
        const group = await this.groupsRepository.findOne({
          where: { id: groupId }
        });
        
        if (!group) {
          console.error(`Grupa ${groupId} nie znaleziona`);
          groupName = undefined;
        } else {
          groupName = group.name;
        }
        
        // Pobierz wszystkich użytkowników
        const allUsers = await this.usersService.findAll();
        console.log(`Znaleziono ${allUsers.length} użytkowników w systemie`);
        console.log(`Użytkownicy:`, allUsers.map(u => ({
          id: u.id,
          email: u.email,
          role: u.role,
          groupId: u.groupId,
          emailVerified: u.emailVerified
        })));
        
        // Filtruj: rodzice z tej grupy + opiekun grupy + admini
        recipients = allUsers.filter(user => 
          user.id !== authorId && ( // Nie wysyłaj autorowi
            user.role === 'ADMIN' ||
            (user.role === 'CAREGIVER' && user.groupId === groupId) ||
            (user.role === 'PARENT' && user.groupId === groupId)
          )
        );
        
        console.log(`Po filtrowaniu dla grupy ${groupId}: ${recipients.length} odbiorców`);
      } else {
        // Ogłoszenie globalne - wyślij do wszystkich (oprócz autora)
        const allUsers = await this.usersService.findAll();
        console.log(`Znaleziono ${allUsers.length} użytkowników w systemie`);
        recipients = allUsers.filter(user => user.id !== authorId);
        console.log(`Ogłoszenie globalne - ${recipients.length} odbiorców (wszyscy oprócz autora)`);
      }
      
      // Wyślij emaile
      console.log(`Wysyłanie powiadomień o ogłoszeniu "${announcement.title}" do ${recipients.length} użytkowników`);
      
      let sentCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      
      for (const user of recipients) {
        if (user.email && user.emailVerified) {
          try {
            await this.emailService.sendAnnouncementNotification(
              user.email,
              user.firstName,
              announcement.title,
              announcement.content,
              announcement.priority,
              authorName,
              groupName,
            );
            sentCount++;
            console.log(`Email wysłany do: ${user.email} (${user.role})`);
            
            // Opóźnienie 1 sekundę między emailami (limit Mailtrap)
            if (sentCount < recipients.filter(u => u.email && u.emailVerified).length) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (emailError) {
            errorCount++;
            if (emailError instanceof Error) {
              console.error(`Błąd wysyłania do ${user.email}:`, emailError.message);
            } else {
              console.error(`Błąd wysyłania do ${user.email}:`, String(emailError));
            }
          }
        } else {
          skippedCount++;
          console.log(`Pominięto: ${user.email || 'brak email'} (emailVerified: ${user.emailVerified})`);
        }
      }
      
      console.log(`Powiadomienia email: ${sentCount} wysłane, ${errorCount} błędów, ${skippedCount} pominięte`);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Błąd podczas wysyłania powiadomień:', error.message);
      } else {
        console.error('Błąd podczas wysyłania powiadomień:', String(error));
      }
      // Nie rzucamy błędu - wysyłanie emaili nie powinno blokować tworzenia ogłoszenia
    }
  }

  async findAll(userRole: string, userGroupId?: string): Promise<Announcement[]> {
    console.log(`findAll - userRole: ${userRole}, userGroupId: ${userGroupId}`);
    
    const query = this.announcementsRepository
      .createQueryBuilder('announcement')
      .leftJoinAndSelect('announcement.author', 'author')
      .leftJoinAndSelect('announcement.group', 'group')
      .orderBy('announcement.createdAt', 'DESC');

    // Rodzice i opiekunowie widzą tylko ogłoszenia globalne i ze swojej grupy
    if (userRole === 'PARENT' || userRole === 'CAREGIVER') {
      query.where('announcement.groupId IS NULL OR announcement.groupId = :groupId', { 
        groupId: userGroupId 
      });
    }

    const results = await query.getMany();
    console.log(`Zwrócono ${results.length} ogłoszeń`);
    console.log(`Pierwsze ogłoszenie - author: ${results[0]?.author ? 'present' : 'null'}, title: ${results[0]?.title}`);

    return results;
  }

  async findOne(id: string): Promise<Announcement> {
    const announcement = await this.announcementsRepository.findOne({
      where: { id },
      relations: ['author', 'group'],
    });

    if (!announcement) {
      throw new NotFoundException('Ogłoszenie nie znalezione');
    }

    return announcement;
  }

  async delete(id: string, userId: string, userRole: string): Promise<void> {
    const announcement = await this.findOne(id);

    // Tylko autor lub admin może usunąć
    if (announcement.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Nie możesz usunąć tego ogłoszenia');
    }

    await this.announcementsRepository.remove(announcement);
  }

  async markAsViewed(announcementId: string, userId: string): Promise<void> {
    // Sprawdź czy ogłoszenie istnieje
    const announcement = await this.announcementsRepository.findOne({
      where: { id: announcementId },
    });

    if (!announcement) {
      throw new NotFoundException('Ogłoszenie nie znalezione');
    }

    // Użyj bezpośredniego INSERT z ON CONFLICT DO NOTHING dla lepszej wydajności
    const connection = this.announcementsRepository.manager.connection;
    try {
      const result = await connection.query(
        'INSERT INTO announcement_views ("announcementId", "userId") VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
        [announcementId, userId]
      );
      console.log(`✓ Marked announcement ${announcementId} as viewed by user ${userId}. Inserted: ${result.length > 0}`);
    } catch (error) {
      // Loguj błąd ale nie rzucaj wyjątku - oznaczanie jako przeczytane nie powinno blokować
      console.error('Error marking announcement as viewed:', error);
    }
  }

  async getUnviewedCount(userId: string, userRole: string, userGroupId?: string): Promise<number> {
    // Użyj bezpośredniego SQL aby uniknąć problemów z cache TypeORM
    const connection = this.announcementsRepository.manager.connection;
    
    let query = `
      SELECT COUNT(*)::int as count
      FROM announcements a
      WHERE NOT EXISTS (
        SELECT 1 FROM announcement_views av 
        WHERE av."announcementId" = a.id AND av."userId" = $1
      )
    `;
    
    const params: any[] = [userId];
    
    // Filtruj według roli i grupy (te same zasady co w findAll)
    if (userRole === 'PARENT' || userRole === 'CAREGIVER') {
      query += ` AND (a."groupId" IS NULL OR a."groupId" = $2)`;
      params.push(userGroupId);
    }
    
    const result = await connection.query(query, params);
    const count = result[0]?.count || 0;
    console.log(`Unviewed count for user ${userId}: ${count}`);
    return count;
  }
}
