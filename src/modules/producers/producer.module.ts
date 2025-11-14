import { Module } from "@nestjs/common"
import { ProducerService } from "./producer.service"
import { ProducerController } from "./producer.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Producer } from "./entities/producer.entity"
import { FilmProducer } from "../film_producer/entities/film_producer.entity"
import { Film } from "../films/entities/film.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Producer, FilmProducer, Film])],
  controllers: [ProducerController],
  providers: [ProducerService],
  exports: [ProducerService],
})
export class ProducerModule {}
