import { Controller, Post, Body, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { User, Public, SkipCheckPermission } from 'src/decorators/customize';
import { Permission } from 'src/decorators/permission.decorator';
import type { IUser } from '../users/interface/user.interface';

@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) { }

  @Post('create-rating')
  @Permission('Create rating', 'RATING')
  createRating(@Body() dto: CreateRatingDto, @User() user: IUser) {
    return this.ratingService.createRating(dto, user);
  }

  @Get('get-rating-by-film/:filmId')
  @Permission('Get ratings by film', 'RATING')
  @Public()
  getRatingsByFilm(@Param('filmId') filmId: string) {
    return this.ratingService.getRatingsByFilm(filmId);
  }

  @SkipCheckPermission()
  @Delete('delete-rating/:ratingId')
  @Permission('Delete rating', 'RATING')
  deleteRating(@Param('ratingId') ratingId: string, @User() user: IUser) {
    return this.ratingService.deleteRating(ratingId, user);
  }
}
