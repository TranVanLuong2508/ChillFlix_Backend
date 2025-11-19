import { forwardRef, Module } from '@nestjs/common';
import { FilmsService } from './films.service';
import { FilmsController } from './films.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Film } from 'src/modules/films/entities/film.entity';
import { FilmGenre } from './entities/film_genre.entity';
import { FilmDirector } from '../film_director/entities/film_director.entity';
import { FilmActor } from '../film_actor/entities/film_actor.entity';
import { FilmImage } from './entities/film_image.entity';
import { FilmProducer } from '../film_producer/entities/film_producer.entity';
import { FilmDirectorModule } from '../film_director/film_director.module';
import { FilmActorModule } from '../film_actor/film_actor.module';

import { SearchModule } from '../search/search.module';

import { CoWatchingModule } from '../co-watching/co-watching.module';
import { RatingModule } from '../rating/rating.module';

import { FilmProducerModule } from '../film_producer/film_producer.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Film, FilmDirector, FilmGenre, FilmActor, FilmImage, FilmProducer]),
    FilmDirectorModule,
    FilmActorModule,
    forwardRef(() => SearchModule), // luong add
    forwardRef(() => CoWatchingModule),
    FilmProducerModule,
    RatingModule,
  ],
  controllers: [FilmsController],
  providers: [FilmsService],
  exports: [FilmsService], //luong add
})
export class FilmsModule {}
