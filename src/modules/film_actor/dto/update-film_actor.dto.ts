import { PartialType } from '@nestjs/mapped-types';
import { CreateFilmActorDto } from './create-film_actor.dto';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateFilmActorDto {
  @IsOptional()
  filmId: string;
  @IsOptional()
  @IsInt()
  actorId: number;
  @IsOptional()
  characterName?: string;
}
