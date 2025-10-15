import { PartialType } from '@nestjs/mapped-types';
import { CreateFilmEpisodeSeasonDto } from './create-film_episode_season.dto';

export class UpdateFilmEpisodeSeasonDto extends PartialType(CreateFilmEpisodeSeasonDto) {}
