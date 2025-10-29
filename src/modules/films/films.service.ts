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
import { FilmGenre } from './entities/film_genre.entity';
import { FilmImage } from './entities/film_image.entity';

@Injectable()
export class FilmsService {
  constructor(
    @InjectRepository(Film) private filmsRepository: Repository<Film>,
    @InjectRepository(FilmGenre) private filmGenreRepository: Repository<FilmGenre>,
    @InjectRepository(FilmImage) private filmImageRepository: Repository<FilmImage>,
  ) {}

  async create(createFilmDto: CreateFilmDto, user: IUser) {
    const filmGenres = createFilmDto.genreCodes.map((g: string) => ({ genreCode: g }));
    const slug = await SlugUtil.generateUniqueSlug(createFilmDto.slug, this.filmsRepository);
    const { genreCodes, ...dataCreate } = createFilmDto;
    const newFilm = this.filmsRepository.create({
      ...dataCreate,
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

    // Data Raw
    const filmDataRaw = await this.filmsRepository.findOne({
      where: { filmId },
      relations: ['filmGenres', 'filmImages'],
      // , 'filmDirectors', 'filmActors'
    });
    console.log('>>Raw: ', filmDataRaw);

    if (!filmDataRaw) {
      throw new NotFoundException(`Film with id ${filmId} not found`);
    }

    const { filmImages, genreCodes, slug, ...otherFilmData } = updateFilmDto;

    // Handle Film_Genre
    let filmGenres: FilmGenre[] | undefined = undefined;
    if (genreCodes) {
      await this.filmGenreRepository.delete({ filmId });

      filmGenres = genreCodes.map((g: string) => {
        return this.filmGenreRepository.manager.create(FilmGenre, {
          genreCode: g,
          filmId,
        });
      });
    }

    // Merge Data with Data Update
    this.filmsRepository.merge(filmDataRaw, otherFilmData);

    // Handle Slug
    if (slug !== '' && slug !== filmDataRaw.slug) {
      const slug = await SlugUtil.generateUniqueSlug(filmDataRaw.slug, this.filmsRepository);
      filmDataRaw.slug = slug;
    }

    if (filmGenres !== undefined) {
      filmDataRaw.filmGenres = filmGenres;
    }

    console.log('Check data updated: ', filmDataRaw);

    filmDataRaw.updatedBy = user.userId.toString();

    try {
      this.filmsRepository.save(filmDataRaw);

      // Handle FIlm_Image
      if (filmImages) {
        await this.updateFilmImage(filmId, filmImages);
      }

      return {
        message: 'Update Film successful',
        affectedRows: 1,
      };
    } catch (error) {
      throw new InternalServerErrorException(error || error.message);
    }
  }

  async updateFilmImage(filmId: string, images: { type: 'poster' | 'horizontal' | 'backdrop'; url: string }[]) {
    const existImages = await this.filmImageRepository.find({ where: { filmId } });

    for (const img of images) {
      const found = existImages.find((i) => i.type === img.type);
      if (found) {
        found.url = img.url;
        await this.filmImageRepository.save(found);
      } else {
        const newImg = this.filmImageRepository.create({ filmId, ...img });
        await this.filmImageRepository.save(newImg);
      }
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
