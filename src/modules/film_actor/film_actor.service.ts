import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';
import { FilmActor } from './entities/film_actor.entity';
import { Film } from '../films/entities/film.entity';
import { Actor } from '../actor/entities/actor.entity';
import { CreateFilmActorDto } from './dto/create-film_actor.dto';
import { UpdateFilmActorDto } from './dto/update-film_actor.dto';
import aqp from 'api-query-params';

@Injectable()
export class FilmActorService {
  constructor(
    @InjectRepository(FilmActor)
    private readonly filmActorRepo: Repository<FilmActor>,

    @InjectRepository(Film)
    private readonly filmRepo: Repository<Film>,

    @InjectRepository(Actor)
    private readonly actorRepo: Repository<Actor>,
  ) {}

  async createFilmActor(dto: CreateFilmActorDto) {
    try {
      const film = await this.filmRepo.findOne({ where: { filmId: dto.filmId } });
      if (!film) return { EC: 0, EM: `Film ${dto.filmId} not found!` };

      const actor = await this.actorRepo.findOne({ where: { actorId: dto.actorId } });
      if (!actor) return { EC: 0, EM: `Actor ${dto.actorId} not found!` };

      const filmActor = this.filmActorRepo.create({
        film,
        actor,
        characterName: dto.characterName,
      });

      const result = await this.filmActorRepo.save(filmActor);
      return { EC: 1, EM: 'Create film-actor successfully', result };
    } catch (error: any) {
      console.error('Error in createFilmActor:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from createFilmActor service',
      });
    }
  }

  async getAllFilmActors(query: any) {
    try {
      const { filter, sort } = aqp(query);
      const page = query.page || 1;
      const limit = query.limit || 5;
      const skip = (page - 1) * limit;

      delete filter.page;
      delete filter.limit;
      delete filter.skip;
      delete filter.sort;

      let sortOrder: 'ASC' | 'DESC' = 'ASC';
      if (query.sort && typeof query.sort === 'string') {
        const value = query.sort.toLowerCase();
        if (value === 'desc') sortOrder = 'DESC';
      }

      const [data, total] = await this.filmActorRepo.findAndCount({
        relations: ['film', 'actor'],
        where: filter,
        order: { id: sortOrder },
        skip,
        take: limit,
      });

      if (total === 0) return { EC: 1, EM: 'No film-actor records found', meta: { page, limit, total, totalPages: 0 } };

      return {
        EC: 1,
        EM: 'Get all film-actors successfully',
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        data,
      };
    } catch (error: any) {
      console.error('Error in getAllFilmActors:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from getAllFilmActors service',
      });
    }
  }

  async getFilmActorById(id: number) {
    try {
      const filmActor = await this.filmActorRepo.findOne({
        where: { id },
        relations: ['film', 'actor'],
      });
      if (!filmActor) return { EC: 0, EM: `Film-Actor ${id} not found!` };

      return { EC: 1, EM: 'Get film-actor successfully', result: filmActor };
    } catch (error: any) {
      console.error('Error in getFilmActorById:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from getFilmActorById service',
      });
    }
  }
  async getActorsByFilm(filmId: string) {
    try {
      const filmActors = await this.filmActorRepo.find({
        where: { film: { filmId: filmId } },
        relations: ['film', 'actor'],
      });

      if (!filmActors || filmActors.length === 0) {
        return { EC: 0, EM: `No actors found for film ID ${filmId}` };
      }

      const result = filmActors.map((fa) => ({
        id: fa.id,
        filmId: fa.film.filmId,
        title: fa.film.title,
        actorId: fa.actor.actorId,
        actorName: fa.actor.actorName,
        characterName: fa.characterName,
        avatarUrl: fa.actor.avatarUrl,
      }));

      return { EC: 1, EM: 'Get actors by film successfully', result };
    } catch (error: any) {
      console.error('Error in getActorsByFilm:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from getActorsByFilm service',
      });
    }
  }

  async updateFilmActor(id: number, dto: UpdateFilmActorDto) {
    try {
      const filmActor = await this.filmActorRepo.findOne({
        where: { id },
        relations: ['film', 'actor'],
      });
      if (!filmActor) return { EC: 0, EM: `Film-Actor ${id} not found!` };

      if (dto.filmId) {
        const film = await this.filmRepo.findOne({ where: { filmId: dto.filmId } });
        if (!film) return { EC: 0, EM: `Film ${dto.filmId} not found!` };
        filmActor.film = film;
      }

      if (dto.actorId) {
        const actor = await this.actorRepo.findOne({ where: { actorId: dto.actorId } });
        if (!actor) return { EC: 0, EM: `Actor ${dto.actorId} not found!` };
        filmActor.actor = actor;
      }

      if (dto.characterName) filmActor.characterName = dto.characterName;

      const result = await this.filmActorRepo.save(filmActor);
      return { EC: 1, EM: 'Update film-actor successfully', result };
    } catch (error: any) {
      console.error('Error in updateFilmActor:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from updateFilmActor service',
      });
    }
  }

  async deleteFilmActorById(id: number) {
    try {
      const filmActor = await this.filmActorRepo.findOne({ where: { id } });
      if (!filmActor) return { EC: 0, EM: `Film-Actor ${id} not found!` };

      await this.filmActorRepo.remove(filmActor);
      return { EC: 1, EM: 'Delete film-actor successfully' };
    } catch (error: any) {
      console.error('Error in deleteFilmActorById:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from deleteFilmActorById service',
      });
    }
  }
}
