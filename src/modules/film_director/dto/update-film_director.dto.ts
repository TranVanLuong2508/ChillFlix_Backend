import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateFilmDirectorDto {
  @IsNotEmpty()
  filmId: string;

  @IsNotEmpty()
  directorId: number;

  @IsNotEmpty()
  @IsBoolean()
  isMain: boolean;
}
