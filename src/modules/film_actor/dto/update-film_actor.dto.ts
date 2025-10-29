import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFilmActorDto {
  @IsNotEmpty()
  filmId: string;

  @IsNotEmpty()
  actorId: number;

  @IsNotEmpty()
  @IsString()
  characterName: string;
}
