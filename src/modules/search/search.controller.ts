import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { Public, ResponseMessage, SkipCheckPermission } from 'src/decorators/customize';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Film } from '../films/entities/film.entity';

@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    @InjectRepository(Film) private filmsRepository: Repository<Film>,
  ) {}
  @Get('/films')
  @Public()
  @SkipCheckPermission()
  async searchFilms(@Query('q') q: string) {
    return this.searchService.searchFilms(q);
  }

  @Delete('/films')
  @Public()
  @SkipCheckPermission()
  @ResponseMessage('Delete Films index')
  async deleteIndex() {
    return this.searchService.deleteIndexFilm();
  }

  @Get('/sync/films')
  @Public()
  @SkipCheckPermission()
  async syncFilms() {
    const films = await this.filmsRepository.find(); // lấy toàn bộ films
    return this.searchService.bulkIndexFilms(films);
  }

  @Get('/get-All-Films-From-Index')
  @Public()
  @SkipCheckPermission()
  async getAllFilmsFromIndex() {
    return this.searchService.getAllFilmsFromIndex();
  }
}
