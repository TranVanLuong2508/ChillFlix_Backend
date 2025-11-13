import { Module } from '@nestjs/common';
import { DirectorService } from './director.service';
import { DirectorController } from './director.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Director } from './entities/director.entity';
import { AllCode } from 'src/modules/all-codes/entities/all-code.entity';
import { FilmDirector } from '../film_director/entities/film_director.entity';
import { Film } from '../films/entities/film.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Director, AllCode, FilmDirector])],
  controllers: [DirectorController],
  providers: [DirectorService],
  exports: [DirectorService],
})
export class DirectorModule {}
