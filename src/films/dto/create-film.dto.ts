import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateFilmDto {
  @IsNotEmpty({ message: 'filmId must not be empty' })
  @IsString({ message: 'filmId must be STRING format' })
  filmId: string;

  @IsNotEmpty({ message: 'originalTitle must not be empty' })
  @IsString({ message: 'originalTitle must be STRING format' })
  originalTitle: string;

  @IsNotEmpty({ message: 'title must not be empty' })
  @IsString({ message: 'title must be STRING format' })
  title: string;

  @IsNotEmpty({ message: 'description must not be empty' })
  @IsString({ message: 'description must be STRING format' })
  description: string;

  @IsNotEmpty({ message: 'releaseDate must not be empty' })
  @IsDate({ message: 'releaseDate must be DATE format' })
  @Type(() => Date)
  releaseDate: Date;

  @IsNotEmpty({ message: 'year must not be empty' })
  @IsString({ message: 'year must be STRING format' })
  year: string;

  @IsNotEmpty({ message: 'thumbUrl must not be empty' })
  @IsString({ message: 'thumbUrl must be STRING format' })
  thumbUrl: string;

  @IsNotEmpty({ message: 'posterUrl must not be empty' })
  @IsString({ message: 'posterUrl must be STRING format' })
  posterUrl: string;

  @IsNotEmpty({ message: 'slug must not be empty' })
  @IsString({ message: 'slug must be STRING format' })
  slug: string;

  @IsNotEmpty({ message: 'ageCode must not be empty' })
  ageCode: string;

  @IsNotEmpty({ message: 'typeCode must not be empty' })
  typeCode: string;

  @IsArray({ message: 'genreCodes must be ARRAY format' })
  @ArrayNotEmpty({ message: 'genreCodes must not be empty' })
  @IsString({ each: true, message: 'genreCode must not be empty' })
  genreCodes: string[];

  @IsNotEmpty({ message: 'countryCode must not be empty' })
  countryCode: string;

  @IsNotEmpty({ message: 'langCode must not be empty' })
  langCode: string;

  @IsNotEmpty({ message: 'publicStatusCode must not be empty' })
  publicStatusCode: string;
}
