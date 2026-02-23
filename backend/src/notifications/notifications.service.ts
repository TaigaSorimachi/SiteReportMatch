import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { SearchNotificationDto } from './dto/search-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    return this.prisma.notificationLog.create({
      data: {
        userId: dto.userId,
        channel: dto.channel,
        notificationType: dto.notificationType,
        title: dto.title,
        body: dto.body,
        relatedType: dto.relatedType,
        relatedId: dto.relatedId,
      },
    });
  }

  async findAll(query: SearchNotificationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.userId) where.userId = query.userId;
    if (query.channel) where.channel = query.channel;
    if (query.isRead !== undefined) where.isRead = query.isRead;
    if (query.notificationType) where.notificationType = query.notificationType;

    const [data, total] = await Promise.all([
      this.prisma.notificationLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, lastName: true, firstName: true },
          },
        },
      }),
      this.prisma.notificationLog.count({ where }),
    ]);

    return PaginatedResponse.create(data, total, page, limit);
  }

  async markAsRead(id: string) {
    const existing = await this.prisma.notificationLog.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Notification with id ${id} not found`);
    }

    return this.prisma.notificationLog.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notificationLog.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { updated: result.count };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notificationLog.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { unreadCount: count };
  }

  async sendLineNotification(userId: string, title: string, body: string) {
    // Placeholder for LINE Messaging API integration
    this.logger.log(
      `LINE notification attempt - userId: ${userId}, title: ${title}, body: ${body}`,
    );

    // Create a notification log entry with channel='line'
    const notification = await this.prisma.notificationLog.create({
      data: {
        userId,
        channel: 'line',
        notificationType: 'line_message',
        title,
        body,
      },
    });

    this.logger.log(
      `LINE notification log created - id: ${notification.id}`,
    );

    return notification;
  }
}
