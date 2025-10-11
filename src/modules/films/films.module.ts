import { Module } from '@nestjs/common';
import { FilmsService } from './films.service';
import { FilmsController } from './films.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Film } from 'src/modules/films/entities/film.entity';
import { FilmGenre } from './entities/film_genre.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Film, FilmGenre])],
  controllers: [FilmsController],
  providers: [FilmsService],
})
export class FilmsModule {}
