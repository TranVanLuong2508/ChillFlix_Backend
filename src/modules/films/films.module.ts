import { Module } from '@nestjs/common';
import { FilmsService } from './films.service';
import { FilmsController } from './films.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Film } from 'src/modules/films/entities/film.entity';
import { FilmDirector } from '../film_director/entities/film_director.entity';
import { FilmActor } from '../film_actor/entities/film_actor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Film, FilmDirector, FilmActor])],
  controllers: [FilmsController],
  providers: [FilmsService],
})
export class FilmsModule {}
