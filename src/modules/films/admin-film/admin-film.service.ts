import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Film } from '../entities/film.entity';
import { FilmGenre } from '../entities/film_genre.entity';
import { FilmImage } from '../entities/film_image.entity';
import { FilmDirector } from 'src/modules/film_director/entities/film_director.entity';
import { FilmProducer } from 'src/modules/film_producer/entities/film_producer.entity';
import { FilmActor } from 'src/modules/film_actor/entities/film_actor.entity';
import { FilmDirectorService } from 'src/modules/film_director/film_director.service';
import { FilmActorService } from 'src/modules/film_actor/film_actor.service';
import { SearchService } from 'src/modules/search/search.service';
import { FilmProducerService } from 'src/modules/film_producer/film_producer.service';
import { RatingService } from 'src/modules/rating/rating.service';
import aqp from 'api-query-params';
import { isEmpty, isUUID } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { FilmPaginationDto } from '../dto/film-admin.dto';
import { CreateFilmDto } from '../dto/create-film.dto';
import { IUser } from 'src/modules/users/interface/user.interface';
import { SlugUtil } from 'src/common/utils/slug.util';
import { UpdateFilmDto } from '../dto/update-film.dto';

@Injectable()
export class AdminFilmService {
  constructor(
    @InjectRepository(Film) private filmsRepository: Repository<Film>,
    @InjectRepository(FilmGenre) private filmGenreRepository: Repository<FilmGenre>,
    @InjectRepository(FilmImage) private filmImageRepository: Repository<FilmImage>,
    @InjectRepository(FilmDirector) private filmDirectorRepository: Repository<FilmDirector>,
    @InjectRepository(FilmProducer) private filmProducerRepository: Repository<FilmProducer>,
    @InjectRepository(FilmActor) private filmActorRepository: Repository<FilmActor>,
    private filmDirectorService: FilmDirectorService,
    private filmActorService: FilmActorService,
    private searchService: SearchService, //luong add
    private filmProducerService: FilmProducerService,
    private ratingService: RatingService,
  ) {}

  async create(createFilmDto: CreateFilmDto, user: IUser) {
    try {
      const filmGenres = createFilmDto.genreCodes.map((g: string) => ({ genreCode: g }));
      const slug = await SlugUtil.generateUniqueSlug(createFilmDto.slug, this.filmsRepository);
      const { directors, producers, actors, genreCodes, ...dataCreate } = createFilmDto;
      const newFilm = this.filmsRepository.create({
        ...dataCreate,
        slug,
        filmGenres,
        createdBy: user.userId.toString(),
      });
      await this.filmsRepository.save(newFilm);
      await this.searchService.indexFilm(newFilm); //luong add

      if (directors) {
        for (const director of directors) {
          await this.filmDirectorService.createFilmDirector(
            { ...director, filmId: newFilm.filmId },
            user,
          );
        }
      }

      if (producers) {
        for (const producer of producers) {
          await this.filmProducerService.createFilmProducer(
            { ...producer, filmId: newFilm.filmId },
            user,
          );
        }
      }

      if (actors) {
        for (const actor of actors) {
          await this.filmActorService.createFilmActor({ ...actor, filmId: newFilm.filmId }, user);
        }
      }

      return {
        EC: 0,
        EM: 'Create new film success',
        id: newFilm.filmId,
        createdAt: newFilm.createdAt,
      };
    } catch (error) {
      console.error('Error in film service create new film:', error || error.message);
      throw new InternalServerErrorException({
        EC: 5,
        EM: 'Error in film service create new film ',
      });
    }
  }

  async findAll(page: number, limit: number, queryString: string) {
    try {
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
          country: true,
          publicStatus: true,
        },
        skip: offset,
        take: defaultLimit,
      });

      const data = await Promise.all(
        await result.map(async (film) => {
          const result = await this.ratingService.getEverage(film.filmId);
          return {
            ...film,
            ratingEverage: +result.average,
          };
        }),
      );

      return {
        EC: 0,
        EM: 'Get film with query paginate success (admin)',
        meta: {
          current: page,
          pageSize: limit,
          pages: totalPages,
          total: totalItems,
        },
        result: plainToInstance(FilmPaginationDto, data),
      };
    } catch (error) {
      console.error('Error in film service get film paginate(admin):', error.message);
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error in film service get film paginate',
      });
    }
  }

  async update(filmId: string, updateFilmDto: UpdateFilmDto, user: IUser) {
    try {
      if (!isUUID(filmId)) {
        throw new BadRequestException({
          EC: 1,
          EM: `Invalid UUID format: ${filmId}`,
        });
      }

      // Data Raw
      const filmDataRaw = await this.filmsRepository.findOne({
        where: { filmId },
        relations: ['filmGenres', 'filmImages'],
      });

      if (!filmDataRaw) {
        throw new NotFoundException({
          EC: 2,
          EM: `Film with id ${filmId} not found`,
        });
      }

      const { actors, directors, producers, filmImages, genreCodes, slug, ...otherFilmData } =
        updateFilmDto;

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

      this.filmsRepository.merge(filmDataRaw, otherFilmData);

      if (slug !== '' && slug !== filmDataRaw.slug) {
        const slug = await SlugUtil.generateUniqueSlug(filmDataRaw.slug, this.filmsRepository);
        filmDataRaw.slug = slug;
      }

      if (filmGenres !== undefined) {
        filmDataRaw.filmGenres = filmGenres;
      }

      filmDataRaw.updatedBy = user.userId.toString();

      await this.filmsRepository.save(filmDataRaw);
      await this.searchService.updateFilmDocument(filmDataRaw); //luong add

      if (filmImages) {
        await this.updateFilmImage(filmId, filmImages);
      }

      if (directors) {
        await this.updateFilmDirector(filmId, directors, user);
      }

      if (producers) {
        await this.updateFilmProducer(filmId, producers, user);
      }

      if (actors) {
        await this.updateFilmActor(filmId, actors, user);
      }

      return {
        EC: 0,
        EM: 'Update film success',
        message: 'Update Film successful',
        affectedRows: 1,
      };
    } catch (error) {
      console.log('Error in service update film: ', error || error.message);
      throw new InternalServerErrorException({
        EC: 3,
        EM: 'Error in service update film',
      });
    }
  }

  async updateFilmImage(
    filmId: string,
    images: { type: 'poster' | 'horizontal' | 'backdrop'; url: string }[],
  ) {
    try {
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
    } catch (error) {
      console.log('Error in film service update film image: ', error || error.message);
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error in film service update film image',
      });
    }
  }

  async updateFilmDirector(
    filmId: string,
    directors: { filmId: string; directorId: number; isMain: boolean }[],
    user: IUser,
  ) {
    try {
      const existDirector = await this.filmDirectorRepository.find({
        where: { film: { filmId } },
        relations: ['film', 'director'],
      });

      for (const director of directors) {
        const found = existDirector.find((d) => d.director.directorId === director.directorId);
        let response: any = null;
        if (found) {
          response = await this.filmDirectorService.updateFilmDirector(found.id, director, user);
        } else {
          response = await this.filmDirectorService.createFilmDirector(director, user);
        }
        if (!response.EC) {
          return response;
        }
      }
    } catch (error) {
      console.log('Error in film service update film director: ', error || error.message);
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error in film service update film director',
      });
    }
  }

  async updateFilmProducer(
    filmId: string,
    producers: { filmId: string; producerId: number; isMain: boolean }[],
    user: IUser,
  ) {
    try {
      const existProducer = await this.filmProducerRepository.find({
        where: { film: { filmId } },
        relations: ['film', 'producer'],
      });

      for (const producer of producers) {
        const found = existProducer.find((p) => p.producer.producerId === producer.producerId);
        let response: any = null;
        if (found) {
          response = await this.filmProducerService.updateFilmProducer(found.id, producer, user);
        } else {
          response = await this.filmProducerService.createFilmProducer(producer, user);
        }
        if (!response.EC) {
          return response;
        }
      }
    } catch (error) {
      console.log('Error in film service update film producer: ', error || error.message);
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error in film service update film producer',
      });
    }
  }

  async updateFilmActor(
    filmId: string,
    actors: { filmId: string; actorId: number; characterName: string }[],
    user: IUser,
  ) {
    try {
      const existActor = await this.filmActorRepository.find({
        where: { film: { filmId } },
        relations: ['film', 'actor'],
      });

      for (const actor of actors) {
        const found = existActor.find((d) => d.actor.actorId === actor.actorId);
        let response: any = null;
        if (found) {
          response = await this.filmActorService.updateFilmActor(found.id, actor, user);
        } else {
          response = await this.filmActorService.createFilmActor(actor, user);
        }
        if (!response.EC) {
          return response;
        }
      }
    } catch (error) {
      console.log('Error in film service update film actor: ', error || error.message);
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error in film service update film actor',
      });
    }
  }

  async remove(filmId: string, user: IUser) {
    try {
      if (!isUUID(filmId)) {
        throw new BadRequestException({
          EC: 1,
          EM: `Invalid UUID format: ${filmId}`,
        });
      }
      const isExist = await this.filmsRepository.exists({ where: { filmId } });
      if (!isExist) {
        throw new NotFoundException({
          EC: 2,
          EM: `Film with filmId ${filmId} not found`,
        });
      }
      await this.filmsRepository.update(filmId, { deletedBy: user.userId.toString() });
      await this.filmsRepository.softDelete(filmId);
      await this.searchService.removeFilmFromIndex(filmId); //luong add

      return { EC: 0, EM: 'Delet film success', deleted: 'success' };
    } catch (error) {
      console.log('Error in film service delete film: ', error || error.message);
      throw new InternalServerErrorException({
        EC: 3,
        EM: 'Error in film service delete film',
      });
    }
  }
}
