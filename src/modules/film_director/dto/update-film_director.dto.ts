import { IsBoolean, IsInt, IsOptional, IsUUID } from 'class-validator';

export class UpdateFilmDirectorDto {
  filmId: string;

  @IsOptional()
  @IsInt()
  directorId: number;

  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}
