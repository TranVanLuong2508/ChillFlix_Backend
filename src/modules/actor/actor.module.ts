import { Module } from '@nestjs/common';
import { ActorService } from './actor.service';
import { ActorController } from './actor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actor } from './entities/actor.entity';
import { AllCode } from '../all-codes/entities/all-code.entity';
import { Film } from '../films/entities/film.entity';
import { FilmActor } from '../film_actor/entities/film_actor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Actor, AllCode, FilmActor])],
  controllers: [ActorController],
  providers: [ActorService],
  exports: [ActorService],
})
export class ActorModule {}
