import { Controller, Get, Post, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Public, SkipCheckPermission, User } from 'src/decorators/customize';
import type { IUser } from '../users/interface/user.interface';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @SkipCheckPermission()
  getNotifications(@User() user: IUser, @Query() query: any) {
    return this.notificationsService.getNotifications(user, query);
  }

  @Get('unread-count')
  @SkipCheckPermission()
  getUnreadCount(@User() user: IUser) {
    return this.notificationsService.getUnreadCount(user.userId);
  }

  @Patch(':id/read')
  @SkipCheckPermission()
  markAsRead(@Param('id') id: string, @User() user: IUser) {
    return this.notificationsService.markAsRead(parseInt(id), user);
  }

  @Patch('read-all')
  @SkipCheckPermission()
  markAllAsRead(@User() user: IUser) {
    return this.notificationsService.markAllAsRead(user);
  }

  @Delete(':id')
  @SkipCheckPermission()
  deleteNotification(@Param('id') id: string, @User() user: IUser) {
    return this.notificationsService.deleteNotification(parseInt(id), user);
  }
}
