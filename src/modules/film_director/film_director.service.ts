import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFilmDirectorDto } from './dto/create-film_director.dto';
import { UpdateFilmDirectorDto } from './dto/update-film_director.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FilmDirector } from './entities/film_director.entity';
import { Not, Repository } from 'typeorm';
import { Film } from '../films/entities/film.entity';
import { Director } from '../directors/entities/director.entity';

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
    const film = await this.filmRepo.findOne({ where: { filmId: dto.filmId } });
    const director = await this.directorRepo.findOne({ where: { directorId: dto.directorId } });

    if (!film || !director) {
      throw new NotFoundException('Film or Director not found');
    }

    const exists = await this.filmDirectorRepo.findOne({
      where: { film: { filmId: dto.filmId }, director: { directorId: dto.directorId } },
    });
    if (exists) {
      throw new BadRequestException('This director is already associated with this film');
    }

    const newFilmDirector = this.filmDirectorRepo.create({
      film,
      director,
      isMain: dto.isMain || false,
    });
    const savedFilmDirector = await this.filmDirectorRepo.save(newFilmDirector);
    return { EC: 0, EM: 'Create film director successfully', result: savedFilmDirector };
  }

  async findAllFilmDirectors(page = 1, limit = 10, sort: 'ASC' | 'DESC' = 'ASC') {
    const [data, total] = await this.filmDirectorRepo.findAndCount({
      relations: ['film', 'director'],
      order: { id: sort },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      EC: 0,
      EM: 'Get all film directors successfully',
      total,
      page,
      limit,
      data,
    };
  }

  async getDirectorsByFilm(filmId: string) {
    const film = await this.filmRepo.findOne({
      where: { filmId },
      relations: ['filmDirectors', 'filmDirectors.director'],
    });
    if (!film) {
      throw new NotFoundException('Film not found');
    }

    const directors = film.filmDirectors.map((fd) => ({
      directorId: fd.director.directorId,
      directorName: fd.director.directorName,
      isMain: fd.isMain,
    }));
    return { EC: 0, EM: 'Get directors by film successfully', directors };
  }

  async getFilmsByDirector(directorId: number) {
    const director = await this.directorRepo.findOne({
      where: { directorId },
      relations: ['filmDirectors', 'filmDirectors.film'],
    });
    if (!director) {
      throw new NotFoundException('Director not found');
    }

    const films = director.filmDirectors.map((fd) => ({
      filmId: fd.film.filmId,
      title: fd.film.title,
      isMain: fd.isMain,
    }));
    return { EC: 0, EM: 'Get films by director successfully', films };
  }

  async updateFilmDirector(id: number, dto: UpdateFilmDirectorDto) {
    const relation = await this.filmDirectorRepo.findOne({
      where: { id },
      relations: ['film', 'director'],
    });

    if (dto.filmId && dto.directorId) {
      const exists = await this.filmDirectorRepo.findOne({
        where: { film: { filmId: dto.filmId }, director: { directorId: dto.directorId } },
      });
      if (exists && exists.id !== id) {
        throw new BadRequestException('This director is already associated with this film');
      }
    }

    if (!relation) {
      throw new NotFoundException(`Relation ${id} not found`);
    }

    if (dto.filmId) {
      const film = await this.filmRepo.findOne({ where: { filmId: dto.filmId } });

      if (!film) {
        throw new BadRequestException(`Film ${dto.filmId} is invalid!`);
      }
      relation.film = film;
    }


    if (dto.directorId) {
      const director = await this.directorRepo.findOne({
        where: { directorId: dto.directorId },
      });
      if (!director) {
        throw new BadRequestException(`Director  ${dto.directorId} is invalid!`);
      }
      relation.director = director;
    }

    if (dto.isMain !== undefined) {
      relation.isMain = dto.isMain;
    }

    const updated = await this.filmDirectorRepo.save(relation);

    return {
      EC: 0,
      EM: 'Update film director relation successfully',
      data: updated,
    };
  }

  async removeFilmDirector(id: number) {
    const deleteFilmDirector = await this.filmDirectorRepo.findOne({ where: { id } });
    if (!deleteFilmDirector) {
      throw new NotFoundException('FilmDirector not found');
    }
    await this.filmDirectorRepo.remove(deleteFilmDirector);
    return { EC: 0, EM: 'Delete film director successfully' };
  }
}
