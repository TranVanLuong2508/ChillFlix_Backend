import { Exclude, Expose, Type } from 'class-transformer';
import { Episode } from 'src/modules/episodes/entities/episode.entity';

@Exclude()
export class episodeDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  episodeNumber: number;

  @Expose()
  duration: number;

  @Expose()
  videoUrl: string;

  @Expose()
  thumbUrl: string;
}

@Exclude()
export class PartResponseUser {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  partNumber: number;

  @Expose()
  description: string;

  @Expose()
  filmId: string;

  @Expose()
  @Type(() => episodeDto)
  episodes: episodeDto[];
}

export class PartResponseFindAll {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  partNumber: number;

  @Expose()
  description: string;

  @Expose()
  episodes: Episode[];
}
