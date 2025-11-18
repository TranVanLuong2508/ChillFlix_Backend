import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { PlaylistFilmService } from '../playlist-film/playlist-film.service';
import { Public, SkipCheckPermission, User } from 'src/decorators/customize';
import type { IUser } from '../users/interface/user.interface';
import { AddFilmToPlaylistDto } from './dto/add-film-to-playlist.dto';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  @SkipCheckPermission()
  createPlaylist(@User() user: IUser, @Body() dto: CreatePlaylistDto) {
    return this.playlistsService.createPlaylist(user.userId, dto);
  }

  @Get('all-playlist')
  @SkipCheckPermission()
  getUserPlaylists(@User() user: IUser) {
    return this.playlistsService.getUserAllPlaylists(user.userId);
  }

  @Get(':id')
  @SkipCheckPermission()
  getPlaylistDetail(@Param('id') playlistId: string) {
    return this.playlistsService.getPlaylistDetail(playlistId);
  }

  @Post('add-film')
  @SkipCheckPermission()
  addFilm(@User() user: IUser, @Body() dto: AddFilmToPlaylistDto) {
    return this.playlistsService.addFilmToPlaylist(user.userId, dto);
  }

  @Delete(':id/film/:filmId')
  @SkipCheckPermission()
  removeFilm(@Param('id') playlistId: string, @Param('filmId') filmId: string) {
    return this.playlistsService.removeFilmFromPlaylist(playlistId, filmId);
  }
}
