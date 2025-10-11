import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { FilmGenre } from 'src/modules/films/entities/film_genre.entity';

export class AllCodeDto {
  @Expose()
  keyMap: string;

  @Expose()
  valueEn: string;

  @Expose()
  valueVi: string;

  @Expose()
  description?: string;
}

export class FilmResponseDto {
  @Expose()
  id: string;

  @Expose()
  filmId: string;

  @Expose()
  originalTitle: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  releaseDate: string;

  @Expose()
  year: string;

  @Expose()
  thumbUrl: string;

  @Expose()
  posterUrl: string;

  @Expose()
  slug: string;

  @Expose()
  view: string;

  @Expose()
  genreCodes: string[];

  @Expose({ name: 'genres' })
  @Transform(({ obj }) => obj.filmGenres?.map((fg) => fg.genre) || [])
  @Type(() => AllCodeDto)
  genres: AllCodeDto[];

  @Expose()
  @Type(() => AllCodeDto)
  age: AllCodeDto;

  @Expose()
  @Type(() => AllCodeDto)
  type: AllCodeDto;

  @Expose()
  @Type(() => AllCodeDto)
  country: AllCodeDto;

  @Expose()
  @Type(() => AllCodeDto)
  language: AllCodeDto;

  @Expose()
  @Type(() => AllCodeDto)
  publicStatus: AllCodeDto;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;

  @Expose()
  deletedAt?: Date;

  @Expose()
  createdBy?: string;

  @Expose()
  updatedBy?: string;

  @Expose()
  deletedBy?: string;

  @Exclude({ toPlainOnly: true })
  filmGenres: any[];

  @Exclude()
  publicStatusCode: string;

  @Exclude()
  langCode: string;

  @Exclude()
  countryCode: string;

  @Exclude()
  typeCode: string;

  @Exclude()
  ageCode: string;
}

export class FilmPaginationDto {}
