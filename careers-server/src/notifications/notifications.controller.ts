import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth';
import { LogAction } from '../user-logs/user-logs.interceptor';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(
    @Request() req: { user: { userId: string } },
    @Query('limit') limit = '50',
    @Query('skip') skip = '0',
  ) {
    const limitNum = parseInt(limit, 10);
    const skipNum = parseInt(skip, 10);
    return this.notificationsService.findAllForUser(
      req.user.userId,
      limitNum,
      skipNum,
    );
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: { user: { userId: string } }) {
    return {
      count: await this.notificationsService.getUnreadCount(req.user.userId),
    };
  }

  @Post(':id/read')
  @LogAction('mark_notification_read', 'notification')
  async markAsRead(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.notificationsService.markAsRead(id, req.user.userId);
  }

  @Post('mark-all-read')
  @LogAction('mark_all_notifications_read', 'notification')
  async markAllAsRead(@Request() req: { user: { userId: string } }) {
    await this.notificationsService.markAllAsRead(req.user.userId);
    return { success: true };
  }

  @Delete(':id')
  @LogAction('delete_notification', 'notification')
  async delete(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    await this.notificationsService.delete(id, req.user.userId);
    return { success: true };
  }

  @Delete()
  @LogAction('delete_all_notifications', 'notification')
  async deleteAll(@Request() req: { user: { userId: string } }) {
    await this.notificationsService.deleteAll(req.user.userId);
    return { success: true };
  }
}
