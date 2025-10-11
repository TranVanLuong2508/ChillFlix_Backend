import { Controller, Post, Get, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { FilmDirectorService } from './film_director.service';
import { CreateFilmDirectorDto } from './dto/create-film_director.dto';
import { UpdateFilmDirectorDto } from './dto/update-film_director.dto';
import { ResponseMessage } from 'src/decorators/customize';
import { PaginationfdDto } from './dto/pagination-fd.dto';
import { filter } from 'rxjs';

@Controller('film-director')
export class FilmDirectorController {
  constructor(private readonly filmDirectorService: FilmDirectorService) {}

  @Post('create-film-director')
  @ResponseMessage('Create relation between film and director')
  create(@Body() dto: CreateFilmDirectorDto) {
    return this.filmDirectorService.createFilmDirector(dto);
  }

  @Get('all-film-directors')
  @ResponseMessage('Get all film-director relations')
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('sort') sort?: 'ASC' | 'DESC') {
    const currentPage = Number(page) || 1;
    const currentLimit = Number(limit) || 10;
    const currentSort = sort?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const result = await this.filmDirectorService.findAllFilmDirectors(currentPage, currentLimit, currentSort);

    return {
      success: true,
      message: result.EM,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
      result: result.data.map((fd) => ({
        id: fd.id,
        isMain: fd.isMain,
        film: fd.film ? { filmId: fd.film.filmId, title: fd.film.title } : null,
        director: fd.director ? { directorId: fd.director.directorId, name: fd.director.directorName } : null,
      })),
    };
  }

  @Get('by-film')
  @ResponseMessage('Get directors by film')
  getDirectorsByFilm(@Query('filmId') filmId: string) {
    return this.filmDirectorService.getDirectorsByFilm(filmId);
  }

  @Get('by-director')
  @ResponseMessage('Get films by director')
  getFilmsByDirector(@Query('directorId') directorId: number) {
    return this.filmDirectorService.getFilmsByDirector(directorId);
  }

  @Patch('edit-film-director')
  @ResponseMessage('Update film-director relation')
  update(@Query('id') id: number, @Body() dto: UpdateFilmDirectorDto) {
    return this.filmDirectorService.updateFilmDirector(id, dto);
  }

  @Delete('remove-film-director')
  @ResponseMessage('Delete film-director relation')
  remove(@Query('id') id: number) {
    return this.filmDirectorService.removeFilmDirector(id);
  }
}
