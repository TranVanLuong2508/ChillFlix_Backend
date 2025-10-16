import { Exclude, Expose, plainToInstance, Transform, Type } from 'class-transformer';

@Exclude()
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

@Exclude()
export class FilmResponseDto {
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

  @Expose()
  @Transform(
    ({ obj }) => {
      if (!obj.filmGenres || !Array.isArray(obj.filmGenres)) {
        return [];
      }
      return obj.filmGenres.map((fg) => fg.genre).filter(Boolean);
    },
    { toClassOnly: true },
  )
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
  @Exclude({ toPlainOnly: true })
  filmGenres: any[];
}

@Exclude()
export class FilmPaginationDto {
  @Expose()
  filmId: string;

  @Expose()
  originalTitle: string;

  @Expose()
  posterUrl: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  year: string;

  @Expose()
  slug: string;

  @Expose()
  view: string;

  @Expose()
  @Type(() => AllCodeDto)
  age: AllCodeDto;

  @Expose()
  @Type(() => AllCodeDto)
  language: AllCodeDto;

  @Expose()
  @Transform(
    ({ obj }) => {
      if (!obj.filmGenres || !Array.isArray(obj.filmGenres)) {
        return [];
      }
      return obj.filmGenres.map((fg) => fg.genre).filter(Boolean);
    },
    { toClassOnly: true },
  )
  @Type(() => AllCodeDto)
  genres: AllCodeDto[];

  @Expose()
  @Exclude({ toPlainOnly: true })
  filmGenres: any[];
}
