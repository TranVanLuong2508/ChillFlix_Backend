import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { FilmActorService } from './film_actor.service';
import { CreateFilmActorDto } from './dto/create-film_actor.dto';
import { UpdateFilmActorDto } from './dto/update-film_actor.dto';
import { ResponseMessage } from 'src/decorators/customize';
import { PaginationFaDto } from './dto/pagination-fa.dto';

@Controller('film-actor')
export class FilmActorController {
  constructor(private readonly filmActorService: FilmActorService) {}

  @Post('create-film-actor')
  @ResponseMessage('Create relation between film and actor')
  async create(@Body() dto: CreateFilmActorDto) {
    return await this.filmActorService.createFilmActor(dto);
  }

  @Get('all-film-actors')
  @ResponseMessage('Get all film-actor relations')
  async getAll(@Query() query: PaginationFaDto) {
    const result = await this.filmActorService.getAllFilmActors(query);

    return {
      success: true,
      message: result.EM,
      meta: result.meta,
      result: result.data?.map((fa) => ({
        id: fa.id,
        film: fa.film ? { filmId: fa.film.filmId, title: fa.film.title } : null,
        actor: fa.actor ? { actorId: fa.actor.actorId, name: fa.actor.actorName } : null,
        characterName: fa.characterName,
      })),
    };
  }

  @Get('get-film-actor-by-id/:id')
  @ResponseMessage('Get film-actor relation by id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return await this.filmActorService.getFilmActorById(id);
  }

  @Get('get-actors-by-film/:filmId')
  @ResponseMessage('Get actors by film id')
  async getActorsByFilm(@Param('filmId') filmId: string) {
    return await this.filmActorService.getActorsByFilm(filmId);
  }

  @Patch('edit-film-actor/:id')
  @ResponseMessage('Update film-actor relation by id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFilmActorDto) {
    return await this.filmActorService.updateFilmActor(id, dto);
  }

  @Delete('delete-film-actor-by-id/:id')
  @ResponseMessage('Delete film-actor relation by id')
  async deleteById(@Param('id', ParseIntPipe) id: number) {
    return await this.filmActorService.deleteFilmActorById(id);
  }
}
