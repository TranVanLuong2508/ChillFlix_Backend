import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateFilmDirectorDto {
  @IsNotEmpty()
  filmId: string;

  @IsNotEmpty()
  directorId: number;

  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}
