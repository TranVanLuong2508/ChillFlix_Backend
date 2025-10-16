import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { CreateFilmDirectorDto } from './dto/create-film_director.dto';
import { UpdateFilmDirectorDto } from './dto/update-film_director.dto';
import { FilmDirector } from './entities/film_director.entity';
import { Film } from '../films/entities/film.entity';
import { Director } from '../directors/entities/director.entity';
import { PaginationfdDto } from './dto/pagination-fd.dto';

@Injectable()
export class FilmDirectorService {
  constructor(
    @InjectRepository(FilmDirector)
    private readonly filmDirectorRepo: Repository<FilmDirector>,
    @InjectRepository(Film)
    private readonly filmRepo: Repository<Film>,
    @InjectRepository(Director)
    private readonly directorRepo: Repository<Director>,
  ) {}

  async createFilmDirector(dto: CreateFilmDirectorDto) {
    try {
      const film = await this.filmRepo.findOne({ where: { filmId: dto.filmId } });
      const director = await this.directorRepo.findOne({ where: { directorId: dto.directorId } });

      if (!film || !director) {
        return { EC: 0, EM: 'Film or Director not found!' };
      }

      const exists = await this.filmDirectorRepo.findOne({
        where: { film: { filmId: dto.filmId }, director: { directorId: dto.directorId } },
      });
      if (exists) {
        return { EC: 0, EM: 'This director is already associated with this film!' };
      }
      if (dto.isMain) {
        const mainExists = await this.filmDirectorRepo.findOne({
          where: { film: { filmId: dto.filmId }, isMain: true },
        });
        if (mainExists) {
          return { EC: 0, EM: 'Main director already exists for this film!' };
        }
      }

      const newFilmDirector = this.filmDirectorRepo.create({
        film,
        director,
        isMain: dto.isMain || false,
      });

      const savedFilmDirector = await this.filmDirectorRepo.save(newFilmDirector);
      return { EC: 1, EM: 'Create film director successfully', result: savedFilmDirector };
    } catch (error: any) {
      console.error('Error in createFilmDirector:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from createFilmDirector service',
      });
    }
  }

  async getAllFilmDirectors(query: PaginationfdDto) {
    try {
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const sort = query.sort?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      const skip = (page - 1) * limit;

      const [data, total] = await this.filmDirectorRepo.findAndCount({
        relations: ['film', 'director'],
        order: { id: sort },
        skip,
        take: limit,
      });

      const formatted = data.map((fd) => ({
        id: fd.id,
        isMain: fd.isMain,
        film: fd.film
          ? { filmId: fd.film.filmId, title: fd.film.title, slugFilm: fd.film ? fd.film.slug : null }
          : null,

        director: fd.director
          ? {
              directorId: fd.director.directorId,
              directorName: fd.director.directorName,
              slugDirector: fd.director ? fd.director.slug : null,
            }
          : null,
      }));
      return {
        EC: 1,
        EM: total > 0 ? 'Get all film-director relations successfully' : 'No film-director relations found',
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        result: formatted,
      };
    } catch (error: any) {
      console.error('Error in getAllFilmDirectors:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from getAllFilmDirectors service',
      });
    }
  }

  async getFilmDirectorById(id: number) {
    try {
      const filmDirector = await this.filmDirectorRepo.findOne({
        where: { id },
        relations: ['film', 'director'],
      });

      if (!filmDirector) return { EC: 0, EM: `FilmDirector ${id} not found!` };

      return { EC: 1, EM: 'Get filmDirector successfully', filmDirector };
    } catch (error: any) {
      console.error('Error in getFilmDirectorById:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from getFilmDirectorById service',
      });
    }
  }

  async getDirectorsByFilm(filmId: string) {
    try {
      const film = await this.filmRepo.findOne({
        where: { filmId },
        relations: ['filmDirectors', 'filmDirectors.director'],
      });
      if (!film) return { EC: 0, EM: `Film ${filmId} not found!` };

      const directors = film.filmDirectors.map((fd) => ({
        directorId: fd.director.directorId,
        directorName: fd.director.directorName,
        isMain: fd.isMain,
      }));

      return { EC: 1, EM: 'Get directors by film successfully', directors };
    } catch (error: any) {
      console.error('Error in getDirectorsByFilm:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from getDirectorsByFilm service',
      });
    }
  }

  async getFilmsByDirector(directorId: number) {
    try {
      const director = await this.directorRepo.findOne({
        where: { directorId },
        relations: ['filmDirectors', 'filmDirectors.film'],
      });
      if (!director) return { EC: 0, EM: `Director ${directorId} not found!` };

      const films = director.filmDirectors.map((fd) => ({
        filmId: fd.film.filmId,
        title: fd.film.title,
        isMain: fd.isMain,
      }));

      return { EC: 1, EM: 'Get films by director successfully', films };
    } catch (error: any) {
      console.error('Error in getFilmsByDirector:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from getFilmsByDirector service',
      });
    }
  }

  async updateFilmDirector(id: number, dto: UpdateFilmDirectorDto) {
    try {
      const relation = await this.filmDirectorRepo.findOne({
        where: { id },
        relations: ['film', 'director'],
      });
      if (!relation) return { EC: 0, EM: `Relation ${id} not found!` };

      const targetFilmId = dto.filmId ?? relation.film.filmId;
      const targetDirectorId = dto.directorId ?? relation.director.directorId;

      const exists = await this.filmDirectorRepo.findOne({
        where: {
          film: { filmId: targetFilmId },
          director: { directorId: targetDirectorId },
          id: Not(id),
        },
      });
      if (exists) return { EC: 0, EM: 'This director is already associated with this film!' };

      if (dto.filmId) {
        const film = await this.filmRepo.findOne({ where: { filmId: dto.filmId } });
        if (!film) return { EC: 0, EM: `Film ${dto.filmId} is invalid!` };
        relation.film = film;
      }

      if (dto.directorId) {
        const director = await this.directorRepo.findOne({
          where: { directorId: dto.directorId },
        });
        if (!director) return { EC: 0, EM: `Director ${dto.directorId} is invalid!` };
        relation.director = director;
      }

      if (dto.isMain === true) {
        const mainExists = await this.filmDirectorRepo.findOne({
          where: {
            film: { filmId: targetFilmId },
            isMain: true,
            id: Not(id),
          },
          relations: ['film'],
        });
        if (mainExists) return { EC: 0, EM: 'Main director already exists for this film!' };
      }

      if (dto.isMain !== undefined) relation.isMain = dto.isMain;

      await this.filmDirectorRepo.save(relation);

      const result = await this.filmDirectorRepo.findOne({
        where: { id },
        relations: ['film', 'director'],
      });

      return { EC: 1, EM: 'Update film director successfully', result };
    } catch (error: any) {
      console.error('Error in updateFilmDirector:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from updateFilmDirector service',
      });
    }
  }

  async deleteFilmDirector(id: number) {
    try {
      const deleteFilmDirector = await this.filmDirectorRepo.findOne({ where: { id } });
      if (!deleteFilmDirector) return { EC: 0, EM: `FilmDirector ${id} not found!` };

      await this.filmDirectorRepo.remove(deleteFilmDirector);
      return { EC: 1, EM: 'Delete film director successfully' };
    } catch (error: any) {
      console.error('Error in deleteFilmDirector:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from deleteFilmDirector service',
      });
    }
  }
}
