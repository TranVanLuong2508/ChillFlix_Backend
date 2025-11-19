import { Controller, Get, Post, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Public, User } from 'src/decorators/customize';
import type { IUser } from '../users/interface/user.interface';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(@User() user: IUser, @Query() query: any) {
    return this.notificationsService.getNotifications(user, query);
  }

  @Get('unread-count')
  getUnreadCount(@User() user: IUser) {
    return this.notificationsService.getUnreadCount(user.userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @User() user: IUser) {
    return this.notificationsService.markAsRead(parseInt(id), user);
  }

  @Patch('read-all')
  markAllAsRead(@User() user: IUser) {
    return this.notificationsService.markAllAsRead(user);
  }

  @Delete(':id')
  deleteNotification(@Param('id') id: string, @User() user: IUser) {
    return this.notificationsService.deleteNotification(parseInt(id), user);
  }
}
