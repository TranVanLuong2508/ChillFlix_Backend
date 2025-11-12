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
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import type { IUser } from '../users/interface/user.interface';

@Controller('films')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ excludeExtraneousValues: true, enableImplicitConversion: true })
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Post()
  create(@Body() createFilmDto: CreateFilmDto, @User() user: IUser) {
    return this.filmsService.create(createFilmDto, user);
  }

  @Public()
  @Get()
  findAll(@Query('current') page: number, @Query('pageSize') limit: number, @Query() qs: string) {
    return this.filmsService.findAll(page, limit, qs);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filmsService.findOne(id);
  }

  @Public()
  @Get('slug/:slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.filmsService.findOneBySlug(slug);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFilmDto: UpdateFilmDto, @User() user: IUser) {
    return this.filmsService.update(id, updateFilmDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Soft delete film')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.filmsService.remove(id, user);
  }
}
