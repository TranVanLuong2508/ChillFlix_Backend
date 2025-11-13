import { Module } from '@nestjs/common';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Rating } from './entities/rating.entity';
import { Film } from '../films/entities/film.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, Film, User])],
  controllers: [RatingController],
  providers: [RatingService],
})
export class RatingModule {}
