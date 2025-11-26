import { Exclude, Expose, Type } from 'class-transformer';
import { AllCodeDto } from './film-response.dto';

@Exclude()
export class FilmPaginationDto {
  @Expose()
  filmId: string;

  @Expose()
  originalTitle: string;

  @Expose()
  duration?: number;

  @Expose()
  title: string;

  @Expose()
  slug: string;

  @Expose()
  view: string;

  @Expose()
  @Type(() => AllCodeDto)
  language: AllCodeDto;

  @Expose()
  @Type(() => AllCodeDto)
  publicStatus: AllCodeDto;

  @Expose()
  @Type(() => AllCodeDto)
  country: AllCodeDto;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;
}
