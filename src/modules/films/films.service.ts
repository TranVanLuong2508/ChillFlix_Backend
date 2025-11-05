import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Film } from 'src/modules/films/entities/film.entity';
import { Repository } from 'typeorm';
import { SlugUtil } from 'src/common/utils/slug.util';
import { isEmpty, isUUID } from 'class-validator';
import aqp from 'api-query-params';
import { joinWithCommonFields } from 'src/common/utils/join-allcode';
import { plainToInstance } from 'class-transformer';
import { FilmPaginationDto, FilmResponseDto } from './dto/film-response.dto';
import { IUser } from '../users/interface/user.interface';
import { allcodeCommonFields } from 'src/common/utils/CommonField';

@Injectable()
export class FilmsService {
  constructor(@InjectRepository(Film) private filmsRepository: Repository<Film>) {}

  async create(createFilmDto: CreateFilmDto, user: IUser) {
    const isExist = await this.filmsRepository.findOne({
      where: { filmId: createFilmDto.filmId },
      withDeleted: true,
    });
    if (isExist) {
      throw new BadRequestException('Film upload has been created');
    }
    const filmGenres = createFilmDto.genreCodes.map((g: string) => ({ genreCode: g }));
    const slug = await SlugUtil.generateUniqueSlug(createFilmDto.slug, this.filmsRepository);
    const newFilm = this.filmsRepository.create({
      ...createFilmDto,
      slug,
      filmGenres,
      createdBy: user.userId.toString(),
    });
    await this.filmsRepository.save(newFilm);
    return {
      id: newFilm.filmId,
      createdAt: newFilm.createdAt,
    };
  }

  async findAll(page: number, limit: number, queryString: string) {
    const { filter, projection } = aqp(queryString);
    let { sort } = aqp(queryString);

    delete filter.current;
    delete filter.pageSize;

    if (isEmpty(sort)) {
      sort = { createdAt: -1 };
    }

    const offset = (page - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    const totalItems = await this.filmsRepository.count({ where: filter });
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.filmsRepository.find({
      where: filter,
      order: sort,
      select: projection,
      relations: {
        language: true,
        age: true,
        filmGenres: {
          genre: true,
        },
      },
      skip: offset,
      take: defaultLimit,
    });

    return {
      meta: {
        current: page,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result: plainToInstance(FilmPaginationDto, result),
    };
  }

  async findOne(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }

    const queryBuilder = await this.filmsRepository.createQueryBuilder('film');
    joinWithCommonFields(queryBuilder, 'film.language', 'language', allcodeCommonFields);
    joinWithCommonFields(queryBuilder, 'film.age', 'age', allcodeCommonFields);
    joinWithCommonFields(queryBuilder, 'film.type', 'type', allcodeCommonFields);
    joinWithCommonFields(queryBuilder, 'film.country', 'country', allcodeCommonFields);
    joinWithCommonFields(queryBuilder, 'film.publicStatus', 'publicStatus', allcodeCommonFields);
    queryBuilder.leftJoinAndSelect('film.filmGenres', 'filmGenres');
    joinWithCommonFields(queryBuilder, 'filmGenres.genre', 'genre', allcodeCommonFields);

    const film = await queryBuilder.where('film.filmId = :id', { id }).getOne();

    if (!film) {
      throw new NotFoundException(`Film with id ${id} not found`);
    }

    // return film;
    return plainToInstance(FilmResponseDto, film);
  }

  async update(filmId: string, updateFilmDto: UpdateFilmDto, user: IUser) {
    if (!isUUID(filmId)) {
      throw new BadRequestException(`Invalid UUID format: ${filmId}`);
    }

    const filmData = await this.filmsRepository.findOne({
      where: { filmId },
    });
    if (!filmData) {
      throw new NotFoundException(`Film with id ${filmId} not found`);
    }

    if (updateFilmDto.slug) {
      if (filmData.slug !== updateFilmDto.slug) {
        const slug = await SlugUtil.generateUniqueSlug(updateFilmDto.slug, this.filmsRepository);
        updateFilmDto.slug = slug;
      } else {
        delete updateFilmDto.slug;
      }
    }

    Object.assign(filmData, updateFilmDto);
    filmData.updatedBy = user.userId.toString();

    try {
      await this.filmsRepository.save(filmData);
      return {
        message: 'Update Film successful',
        affectedRows: 1,
      };
    } catch (error) {
      throw new InternalServerErrorException(error || error.message);
    }
  }

  async remove(filmId: string, user: IUser) {
    if (!isUUID(filmId)) {
      throw new BadRequestException(`Invalid UUID format: ${filmId}`);
    }
    const isExist = await this.filmsRepository.exists({ where: { filmId } });
    if (!isExist) {
      throw new NotFoundException(`Film with filmId ${filmId} not found`);
    }
    await this.filmsRepository.update(filmId, { deletedBy: user.userId.toString() });
    await this.filmsRepository.softDelete(filmId);
    return { deleted: 'success' };
  }
}
