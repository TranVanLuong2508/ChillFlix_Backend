import { Controller, Post, Body, Get } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';
import { Public, ResponseMessage, SkipCheckPermission, User } from 'src/decorators/customize';
import type { IUser } from '../users/interface/user.interface';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle')
  @SkipCheckPermission()
  toggle(@Body() dto: ToggleFavoriteDto, @User() user: IUser) {
    return this.favoritesService.toggleFavorite(user.userId, dto.filmId);
  }

  @Get('get-by-favid')
  @SkipCheckPermission()
  @ResponseMessage('Add/Delete favorite film')
  getByid(@Body('favId') id: string) {
    return this.favoritesService.getAdocumentbyId(id);
  }

  @Get('get-user-favorite-list')
  @SkipCheckPermission()
  @ResponseMessage('get favorite films list for user')
  getFavoriteList(@User() user: IUser) {
    return this.favoritesService.getUserFavoriteFilmList(user.userId);
  }
}
