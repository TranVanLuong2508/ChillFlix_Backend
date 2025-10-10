import { Injectable } from '@nestjs/common';
import { CreateFilmEpisodeSeasonDto } from './dto/create-film_episode_season.dto';
import { UpdateFilmEpisodeSeasonDto } from './dto/update-film_episode_season.dto';

@Injectable()
export class FilmEpisodeSeasonService {
  create(createFilmEpisodeSeasonDto: CreateFilmEpisodeSeasonDto) {
    return 'This action adds a new filmEpisodeSeason';
  }

  findAll() {
    return `This action returns all filmEpisodeSeason`;
  }

  findOne(id: number) {
    return `This action returns a #${id} filmEpisodeSeason`;
  }

  update(id: number, updateFilmEpisodeSeasonDto: UpdateFilmEpisodeSeasonDto) {
    return `This action updates a #${id} filmEpisodeSeason`;
  }

  remove(id: number) {
    return `This action removes a #${id} filmEpisodeSeason`;
  }
}
