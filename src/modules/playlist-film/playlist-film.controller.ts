import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlaylistFilmService } from './playlist-film.service';
import { CreatePlaylistFilmDto } from './dto/create-playlist-film.dto';
import { UpdatePlaylistFilmDto } from './dto/update-playlist-film.dto';

@Controller('playlist-film')
export class PlaylistFilmController {
  constructor(private readonly playlistFilmService: PlaylistFilmService) {}

  @Post()
  create(@Body() createPlaylistFilmDto: CreatePlaylistFilmDto) {
    return this.playlistFilmService.create(createPlaylistFilmDto);
  }

  @Get()
  findAll() {
    return this.playlistFilmService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playlistFilmService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlaylistFilmDto: UpdatePlaylistFilmDto) {
    return this.playlistFilmService.update(+id, updatePlaylistFilmDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playlistFilmService.remove(+id);
  }
}
