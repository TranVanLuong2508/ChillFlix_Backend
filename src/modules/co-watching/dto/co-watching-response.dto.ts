import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CoWatchingRes {
  @Expose()
  roomId: string;

  @Expose()
  name: string;

  @Expose()
  hostId: number;

  @Expose()
  filmId: string;

  @Expose()
  partNumber: number;

  @Expose()
  episodeNumber: number;

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
