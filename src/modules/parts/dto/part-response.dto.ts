import { Exclude, Expose } from 'class-transformer';
import { Episode } from 'src/modules/episodes/entities/episode.entity';

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
  episodes: Episode[];
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
