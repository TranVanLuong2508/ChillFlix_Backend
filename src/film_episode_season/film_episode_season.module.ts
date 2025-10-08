import { Module } from '@nestjs/common';
import { FilmEpisodeSeasonService } from './film_episode_season.service';
import { FilmEpisodeSeasonController } from './film_episode_season.controller';

@Module({
  controllers: [FilmEpisodeSeasonController],
  providers: [FilmEpisodeSeasonService],
})
export class FilmEpisodeSeasonModule {}
