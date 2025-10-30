import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
} from '@nestjs/common';
import { FilmDirectorService } from './film_director.service';
import { CreateFilmDirectorDto } from './dto/create-film_director.dto';
import { UpdateFilmDirectorDto } from './dto/update-film_director.dto';
import { ResponseMessage, User } from 'src/decorators/customize';
import { PaginationfdDto } from './dto/pagination-fd.dto';
import type { IUser } from '../users/interface/user.interface';

@Controller('film-director')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ excludeExtraneousValues: true, enableImplicitConversion: true })
export class FilmDirectorController {
  constructor(private readonly filmDirectorService: FilmDirectorService) {}

  @Post('create-film-director')
  @ResponseMessage('Create relation between film and director')
  createFilmDirector(@Body() dto: CreateFilmDirectorDto, @User() user: IUser) {
    return this.filmDirectorService.createFilmDirector(dto, user);
  }

  @Get('all-film-directors')
  @ResponseMessage('Get all film-director relations')
  @Get('all-film-directors')
  GetAllFilmDirectors(@Query() query: PaginationfdDto) {
    return this.filmDirectorService.getAllFilmDirectors(query);
  }

  @Get('get-film-director-by-id/:id')
  @ResponseMessage('Get film-director relation by id')
  getFilmDirectorById(@Param('id') id: number) {
    return this.filmDirectorService.getFilmDirectorById(id);
  }

  @Get('by-film/:filmId')
  @ResponseMessage('Get directors by film')
  getDirectorsByFilm(@Param('filmId') filmId: string) {
    return this.filmDirectorService.getDirectorsByFilm(filmId);
  }

  @Get('by-director/:directorId')
  @ResponseMessage('Get films by director')
  getFilmsByDirector(@Param('directorId') directorId: number) {
    return this.filmDirectorService.getFilmsByDirector(directorId);
  }

  @Patch('edit-film-director/:id')
  @ResponseMessage('Update film-director relation')
  updateFilmDirector(@Param('id') id: number, @Body() dto: UpdateFilmDirectorDto, @User() user: IUser) {
    return this.filmDirectorService.updateFilmDirector(id, dto, user);
  }

  @Delete('delete-film-director/:id')
  @ResponseMessage('Delete film-director relation')
  deleteFilmDirector(@Param('id') id: number, @User() user: IUser) {
    return this.filmDirectorService.deleteFilmDirector(id, user);
  }
}
