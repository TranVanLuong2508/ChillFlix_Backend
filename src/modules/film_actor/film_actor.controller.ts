import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
} from '@nestjs/common';
import { FilmActorService } from './film_actor.service';
import { CreateFilmActorDto } from './dto/create-film_actor.dto';
import { UpdateFilmActorDto } from './dto/update-film_actor.dto';
import { Public, ResponseMessage, SkipCheckPermission, User } from 'src/decorators/customize';
import { PaginationFaDto } from './dto/pagination-fa.dto';
import type { IUser } from '../users/interface/user.interface';

@Controller('film-actor')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ excludeExtraneousValues: true, enableImplicitConversion: true })
export class FilmActorController {
  constructor(private readonly filmActorService: FilmActorService) {}

  @Post('create-film-actor')
  @ResponseMessage('Create relation between film and actor')
  async createFilmActor(@Body() dto: CreateFilmActorDto, @User() user: IUser) {
    return await this.filmActorService.createFilmActor(dto, user);
  }

  @Get('all-film-actors')
  @ResponseMessage('Get all film-actor relations')
  async getAllFilmActors(@Query() query: PaginationFaDto) {
    return await this.filmActorService.getAllFilmActors(query);
  }

  @Public()
  @Get('get-film-actor-by-id/:id')
  @ResponseMessage('Get film-actor relation by id')
  async getFilmActorById(@Param('id', ParseIntPipe) id: number) {
    return await this.filmActorService.getFilmActorById(id);
  }

  @Public()
  @SkipCheckPermission()
  @Get('get-actors-by-film/:filmId')
  @ResponseMessage('Get actors by film id')
  async getActorsByFilm(@Param('filmId') filmId: string, query: PaginationFaDto) {
    return await this.filmActorService.getActorsByFilm(filmId, query);
  }

  @Public()
  @Get('get-films-by-actor/:actorId')
  @ResponseMessage('Get films by actor id')
  async getFilmsByActor(@Param('actorId', ParseIntPipe) actorId: number, query: PaginationFaDto) {
    return await this.filmActorService.getFilmsByActor(actorId, query);
  }

  @Patch('edit-film-actor/:id')
  @ResponseMessage('Update film-actor relation by id')
  async updateFilmActor(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFilmActorDto, @User() user: IUser) {
    return await this.filmActorService.updateFilmActor(id, dto, user);
  }

  @Delete('delete-film-actor-by-id/:id')
  @ResponseMessage('Delete film-actor relation by id')
  async deleteFilmActorById(@Param('id', ParseIntPipe) id: number, @User() user: IUser) {
    return await this.filmActorService.deleteFilmActorById(id, user);
  }
}
