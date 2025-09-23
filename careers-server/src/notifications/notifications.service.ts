import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema';

export interface CreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: Record<string, any>;
  createdBy?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  /**
   * Create a new notification
   */
  async create(createNotificationDto: CreateNotificationDto): Promise<NotificationDocument> {
    const notification = new this.notificationModel({
      ...createNotificationDto,
      read: false,
    });
    return notification.save();
  }

  /**
   * Create multiple notifications at once (for notifying multiple users)
   */
  async createMany(createNotificationDtos: CreateNotificationDto[]): Promise<NotificationDocument[]> {
    const notifications = createNotificationDtos.map(dto => new this.notificationModel({
      ...dto,
      read: false,
    }));
    return this.notificationModel.insertMany(notifications);
  }

  /**
   * Get all notifications for a user
   */
  async findAllForUser(userId: string, limit = 50, skip = 0): Promise<{ notifications: NotificationDocument[], total: number }> {
    const [notifications, total] = await Promise.all([
      this.notificationModel.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments({ userId }),
    ]);
    
    return { notifications, total };
  }

  /**
   * Get unread notifications count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({ userId, read: false });
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string, userId: string): Promise<NotificationDocument> {
    const result = await this.notificationModel.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true },
    );
    
    if (!result) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    
    return result;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId, read: false },
      { read: true },
    );
  }

  /**
   * Delete a notification
   */
  async delete(id: string, userId: string): Promise<void> {
    await this.notificationModel.findOneAndDelete({ _id: id, userId });
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAll(userId: string): Promise<void> {
    await this.notificationModel.deleteMany({ userId });
  }
}
