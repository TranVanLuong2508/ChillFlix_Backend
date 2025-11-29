import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
} from '@nestjs/common';
import { FilmsService } from './films.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { Public, ResponseMessage, SkipCheckPermission, User } from 'src/decorators/customize';
import { Permission } from 'src/decorators/permission.decorator';
import type { IUser } from '../users/interface/user.interface';
import { AdminFilmService } from './admin-film/admin-film.service';

@Controller('films')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ excludeExtraneousValues: true, enableImplicitConversion: true })
export class FilmsController {
  constructor(
    private readonly filmsService: FilmsService,
    private readonly adminFilmService: AdminFilmService,
  ) {}

  @Post()
  @Permission('Create a film', 'FILMS')
  create(@Body() createFilmDto: CreateFilmDto, @User() user: IUser) {
    return this.adminFilmService.create(createFilmDto, user);
  }

  @Public()
  @Get('/admin')
  findAllAdmin(
    @Query('current') page: number,
    @Query('pageSize') limit: number,
    @Query() qs: string,
  ) {
    return this.adminFilmService.findAll(page, limit, qs);
  }

  @Public()
  @Get()
  @Permission('Get all films', 'FILMS')
  findAll(@Query('current') page: number, @Query('pageSize') limit: number, @Query() qs: string) {
    return this.filmsService.findAll(page, limit, qs);
  }

  @Public()
  @SkipCheckPermission()
  @Get(':id')
  @Permission('Get film by ID', 'FILMS')
  findOne(@Param('id') id: string) {
    return this.filmsService.findOne(id);
  }

  @Public()
  @Get('slug/:slug')
  @Permission('Get film by slug', 'FILMS')
  findOneBySlug(@Param('slug') slug: string) {
    return this.filmsService.findOneBySlug(slug);
  }

  @Patch(':id')
  @Permission('Update film', 'FILMS')
  update(@Param('id') id: string, @Body() updateFilmDto: UpdateFilmDto, @User() user: IUser) {
    return this.adminFilmService.update(id, updateFilmDto, user);
  }

  @Delete(':id')
  @Permission('Delete film', 'FILMS')
  @ResponseMessage('Soft delete film')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.adminFilmService.remove(id, user);
  }

  @Public()
  @Get('by-country/:countryValueEn')
  @Permission('Get films by country', 'FILMS')
  findByCountry(
    @Param('countryValueEn') countryValueEn: string,
    @Query('current') page: number,
    @Query('pageSize') limit: number,
  ) {
    return this.filmsService.findByCountry(countryValueEn, page, limit);
  }

  @Public()
  @SkipCheckPermission()
  @Get('by-genre/:genreValueEn')
  @Permission('Get films by genre', 'FILMS')
  findByGenre(
    @Param('genreValueEn') genreValueEn: string,
    @Query('current') page: number,
    @Query('pageSize') limit: number,
  ) {
    return this.filmsService.findByGenre(genreValueEn, page, limit);
  }

  @Public()
  @SkipCheckPermission()
  @Get('by-type/:typeValueEn')
  @Permission('Get films by type', 'FILMS')
  findByType(
    @Param('typeValueEn') typeValueEn: string,
    @Query('current') page: number,
    @Query('pageSize') limit: number,
  ) {
    return this.filmsService.findByType(typeValueEn, page, limit);
  }

  @Public()
  @SkipCheckPermission()
  @Get('filter/search')
  @Permission('Search films with filters', 'FILMS')
  findWithFilters(
    @Query('country') country?: string,
    @Query('type') type?: string,
    @Query('age_code') age_code?: string,
    @Query('genre') genre?: string,
    @Query('version') version?: string,
    @Query('year') year?: string,
    @Query('sort') sort?: string,
    @Query('current') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.filmsService.findWithFilters(
      { country, type, age_code, genre, version, year },
      sort,
      page,
      limit,
    );
  }

  @Public()
  @Get('/list-film-by-genre/chatbot')
  getFilmDataForChatBotByGenre() {
    return this.filmsService.getFilmByGenreForChatBotData();
  }

  @Public()
  @Get('/list-film-by-country/chatbot')
  getFilmDataForChatBotByCountry() {
    return this.filmsService.getFilmByCountryForChatBotData();
  }
}
