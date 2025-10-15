import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFilmActorDto {
  @IsNotEmpty()
  filmId: string;
  @IsNotEmpty()
  actorId: number;
  @IsNotEmpty()
  @IsString()
  characterName: string;
}
