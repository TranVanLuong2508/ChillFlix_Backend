import { Controller, Get, Post, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Public, SkipCheckPermission, User } from 'src/decorators/customize';
import type { IUser } from '../users/interface/user.interface';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @SkipCheckPermission()
  @Public()
  @Get()
  getNotifications(@User() user: IUser, @Query() query: any) {
    return this.notificationsService.getNotifications(user, query);
  }

  @SkipCheckPermission()
  @Public()
  @Get('unread-count')
  getUnreadCount(@User() user: IUser) {
    return this.notificationsService.getUnreadCount(user.userId);
  }

  @SkipCheckPermission()
  @Public()
  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @User() user: IUser) {
    return this.notificationsService.markAsRead(parseInt(id), user);
  }

  @SkipCheckPermission()
  @Public()
  @Patch('read-all')
  markAllAsRead(@User() user: IUser) {
    return this.notificationsService.markAllAsRead(user);
  }

  @SkipCheckPermission()
  @Public()
  @Delete(':id')
  deleteNotification(@Param('id') id: string, @User() user: IUser) {
    return this.notificationsService.deleteNotification(parseInt(id), user);
  }
}
