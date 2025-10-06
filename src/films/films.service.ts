import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Film } from 'src/films/entities/film.entity';
import { Repository } from 'typeorm';
import { SlugUtil } from 'src/common/utils/slug.util';
import { isEmpty, isUUID } from 'class-validator';
import aqp from 'api-query-params';

@Injectable()
export class FilmsService {
  constructor(
    @InjectRepository(Film) private filmsRepository: Repository<Film>,
  ) {}

  async create(createFilmDto: CreateFilmDto) {
    const isExist = await this.filmsRepository.findOne({
      where: { filmId: createFilmDto.filmId },
    });
    if (isExist) {
      throw new BadRequestException('Film upload has been created');
    }
    const slug = await SlugUtil.generateUniqueSlug(
      createFilmDto.slug,
      this.filmsRepository,
    );
    const newFilm = this.filmsRepository.create({ ...createFilmDto, slug });
    await this.filmsRepository.save(newFilm);
    return {
      id: newFilm.id,
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
      result,
    };
  }

  async findOne(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }
    const film = await this.filmsRepository.findOne({ where: { id } });
    if (!film) {
      throw new NotFoundException(`Film with id ${id} not found`);
    }
    return film;
  }

  async update(id: string, updateFilmDto: UpdateFilmDto) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }

    const filmData = await this.filmsRepository.findOne({
      where: { id },
    });
    if (!filmData) {
      throw new NotFoundException(`Film with id ${id} not found`);
    }

    if (updateFilmDto.slug) {
      if (filmData.slug !== updateFilmDto.slug) {
        const slug = await SlugUtil.generateUniqueSlug(
          updateFilmDto.slug,
          this.filmsRepository,
        );
        updateFilmDto.slug = slug;
      } else {
        delete updateFilmDto.slug;
      }
    }

    Object.assign(filmData, updateFilmDto);

    try {
      await this.filmsRepository.save(filmData);
      return {
        message: 'Update successful',
        affectedRows: 1,
      };
    } catch (error) {
      throw new InternalServerErrorException(error || error.message);
    }
  }

  async remove(id: string /*, userId: string*/) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }
    // await this.filmsRepository.update(id, { deletedBy: userId });

    return await this.filmsRepository.softDelete(id);
  }
}
