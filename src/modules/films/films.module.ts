import { Module } from '@nestjs/common';
import { FilmsService } from './films.service';
import { FilmsController } from './films.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Film } from 'src/modules/films/entities/film.entity';

import { FilmGenre } from './entities/film_genre.entity';
import { FilmDirector } from '../film_director/entities/film_director.entity';
import { FilmActor } from '../film_actor/entities/film_actor.entity';
import { FilmImage } from './entities/film_image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Film, FilmDirector, FilmGenre, FilmActor, FilmImage])],
  controllers: [FilmsController],
  providers: [FilmsService],
})
export class FilmsModule {}
