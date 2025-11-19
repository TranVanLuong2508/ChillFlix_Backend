import { Controller, Post, Body, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { User, Public, SkipCheckPermission } from 'src/decorators/customize';
import type { IUser } from '../users/interface/user.interface';

@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @SkipCheckPermission()
  @Public()
  @Post('create-rating')
  createRating(@Body() dto: CreateRatingDto, @User() user: IUser) {
    return this.ratingService.createRating(dto, user);
  }

  @Get('get-rating-by-film/:filmId')
  @Public()
  getRatingsByFilm(@Param('filmId') filmId: string) {
    return this.ratingService.getRatingsByFilm(filmId);
  }

  @Delete('delete-rating/:ratingId')
  @SkipCheckPermission()
  @Public()
  deleteRating(@Param('ratingId') ratingId: string, @User() user: IUser) {
    return this.ratingService.deleteRating(ratingId, user);
  }
}
