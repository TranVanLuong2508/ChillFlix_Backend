import { Exclude, Expose, Type } from 'class-transformer';
import { EpisodeFindOne } from 'src/modules/episodes/dto/episode-response.dto';

@Exclude()
export class CoWatchingRes {
  @Expose()
  roomId: string;

  @Expose()
  name: string;

  @Expose()
  hostId: number;

  @Expose()
  episodeId: string;

  @Expose()
  @Type(() => EpisodeFindOne)
  episode: EpisodeFindOne;

  @Expose()
  thumbUrl: string;

  @Expose()
  isLive: boolean;

  @Expose()
  isPrivate: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  duration: number;
}
