import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FilmEpisodeSeasonService } from './film_episode_season.service';
import { CreateFilmEpisodeSeasonDto } from './dto/create-film_episode_season.dto';
import { UpdateFilmEpisodeSeasonDto } from './dto/update-film_episode_season.dto';

@Controller('film-episode-season')
export class FilmEpisodeSeasonController {
  constructor(private readonly filmEpisodeSeasonService: FilmEpisodeSeasonService) {}

  @Post()
  create(@Body() createFilmEpisodeSeasonDto: CreateFilmEpisodeSeasonDto) {
    return this.filmEpisodeSeasonService.create(createFilmEpisodeSeasonDto);
  }

  @Get()
  findAll() {
    return this.filmEpisodeSeasonService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filmEpisodeSeasonService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFilmEpisodeSeasonDto: UpdateFilmEpisodeSeasonDto) {
    return this.filmEpisodeSeasonService.update(+id, updateFilmEpisodeSeasonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filmEpisodeSeasonService.remove(+id);
  }
}
