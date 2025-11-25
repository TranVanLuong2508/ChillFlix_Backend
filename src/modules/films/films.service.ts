import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
import { FilmDirector } from '../film_director/entities/film_director.entity';
import { FilmActor } from '../film_actor/entities/film_actor.entity';
import { FilmProducer } from '../film_producer/entities/film_producer.entity';
import { FilmDirectorService } from '../film_director/film_director.service';
import { FilmActorService } from '../film_actor/film_actor.service';
import { SearchService } from '../search/search.service';
import { FilmProducerService } from '../film_producer/film_producer.service';
import { RatingService } from '../rating/rating.service';

@Injectable()
export class FilmsService {
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
          age: true,
          filmGenres: {
            genre: true,
          },
          filmImages: true,
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

      console.log('>>Check all: ', data);

      return {
        EC: 0,
        EM: 'Get film with query paginate success',
        meta: {
          current: page,
          pageSize: limit,
          pages: totalPages,
          total: totalItems,
        },
        result: plainToInstance(FilmPaginationDto, data),
      };
    } catch (error) {
      console.error('Error in film service get film paginate:', error.message);
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error in film service get film paginate',
      });
    }
  }

  async findOne(id: string) {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException({
          EC: 1,
          EM: `Invalid UUID format: ${id}`,
        });
      }

      const queryBuilder = await this.filmsRepository.createQueryBuilder('film');
      joinWithCommonFields(queryBuilder, 'film.language', 'language', allcodeCommonFields);
      joinWithCommonFields(queryBuilder, 'film.age', 'age', allcodeCommonFields);
      joinWithCommonFields(queryBuilder, 'film.type', 'type', allcodeCommonFields);
      joinWithCommonFields(queryBuilder, 'film.country', 'country', allcodeCommonFields);
      joinWithCommonFields(queryBuilder, 'film.publicStatus', 'publicStatus', allcodeCommonFields);
      queryBuilder.leftJoinAndSelect('film.filmGenres', 'filmGenres');
      queryBuilder.leftJoinAndSelect('film.filmImages', 'filmImages');
      joinWithCommonFields(queryBuilder, 'filmGenres.genre', 'genre', allcodeCommonFields);

      const film = await queryBuilder.where('film.filmId = :id', { id }).getOne();

      if (!film) {
        throw new NotFoundException({
          EC: 2,
          EM: `Film with filmId ${id} not found`,
        });
      }
      const ratingEverage = await this.ratingService.getEverage(film?.filmId);

      const actorsRes = await this.filmActorService.getActorsByFilm(id);
      if (actorsRes.EC) {
        throw new InternalServerErrorException({
          EC: 3,
          EM: actorsRes.EM,
        });
      }

      const directorsRes = await this.filmDirectorService.getDirectorsByFilm(film.filmId);
      if (directorsRes.EC) {
        throw new InternalServerErrorException({
          EC: 4,
          EM: directorsRes.EM,
        });
      }

      const producersRes = await this.filmProducerService.getProducersByFilm(id);
      if (!producersRes || !Object.prototype.hasOwnProperty.call(producersRes, 'result')) {
        throw new InternalServerErrorException({
          EC: 6,
          EM: producersRes?.EM || 'Error fetching producers for film',
        });
      }

      return {
        EC: 0,
        EM: 'Get film by Id success',

        film: plainToInstance(FilmResponseDto, { ...film, ratingEverage: ratingEverage.average }),
        directors: directorsRes.result,
        actors: actorsRes.result,
        producers: producersRes.result,
      };
    } catch (error) {
      console.error('Error in film service get film by Id:', error.message);
      throw new InternalServerErrorException({
        EC: 5,
        EM: 'Error in film service get film by Id',
      });
    }
  }

  async findOneBySlug(slug: string) {
    try {
      const queryBuilder = await this.filmsRepository.createQueryBuilder('film');
      joinWithCommonFields(queryBuilder, 'film.language', 'language', allcodeCommonFields);
      joinWithCommonFields(queryBuilder, 'film.age', 'age', allcodeCommonFields);
      joinWithCommonFields(queryBuilder, 'film.type', 'type', allcodeCommonFields);
      joinWithCommonFields(queryBuilder, 'film.country', 'country', allcodeCommonFields);
      joinWithCommonFields(queryBuilder, 'film.publicStatus', 'publicStatus', allcodeCommonFields);
      queryBuilder.leftJoinAndSelect('film.filmGenres', 'filmGenres');
      queryBuilder.leftJoinAndSelect('film.filmImages', 'filmImages');
      joinWithCommonFields(queryBuilder, 'filmGenres.genre', 'genre', allcodeCommonFields);

      const film = await queryBuilder.where('film.slug = :slug', { slug }).getOne();

      if (!film) {
        throw new NotFoundException({
          EC: 2,
          EM: `Film with film slug ${slug} not found`,
        });
      }

      const ratingEverage = await this.ratingService.getEverage(film?.filmId);

      const actorsRes = await this.filmActorService.getActorsByFilm(film.filmId);
      if (actorsRes.EC) {
        throw new InternalServerErrorException({
          EC: 3,
          EM: actorsRes.EM,
        });
      }

      const directorsRes = await this.filmDirectorService.getDirectorsByFilm(film.filmId);
      if (directorsRes.EC) {
        throw new InternalServerErrorException({
          EC: 4,
          EM: directorsRes.EM,
        });
      }

      const producersRes = await this.filmProducerService.getProducersByFilm(film.filmId);
      if (!producersRes || !Object.prototype.hasOwnProperty.call(producersRes, 'result')) {
        throw new InternalServerErrorException({
          EC: 6,
          EM: producersRes?.EM || 'Error fetching producers for film',
        });
      }

      return {
        EC: 0,
        EM: 'Get film by Id success',
        film: plainToInstance(FilmResponseDto, { ...film, ratingEverage: ratingEverage.average }),
        directors: directorsRes.result,
        producers: producersRes.result,
        actors: actorsRes.result,
      };
    } catch (error) {
      console.error('Error in film service get film by Id:', error.message);
      throw new InternalServerErrorException({
        EC: 5,
        EM: 'Error in film service get film by Id',
      });
    }
  }

  async findByCountry(countryValueEn: string, page: number, limit: number) {
    try {
      if (!countryValueEn || countryValueEn.trim() === '') {
        throw new BadRequestException({
          EC: 1,
          EM: 'Country value (valueEn) is required',
        });
      }

      const offset = (page - 1) * limit;
      const defaultLimit = limit ? limit : 10;
      const defaultPage = page ? page : 1;

      const countryAllCode = await this.filmsRepository
        .createQueryBuilder('film')
        .leftJoinAndSelect('film.country', 'country')
        .where('country.valueEn = :valueEn', { valueEn: countryValueEn })
        .select('country.keyMap', 'countryCode')
        .getRawOne();

      if (!countryAllCode || !countryAllCode.countryCode) {
        return {
          EC: 0,
          EM: `No country found with valueEn: ${countryValueEn}`,
          meta: {
            current: defaultPage,
            pageSize: defaultLimit,
            pages: 0,
            total: 0,
          },
          result: [],
        };
      }

      const countryCode = countryAllCode.countryCode;

      const totalItems = await this.filmsRepository.count({
        where: {
          countryCode,
        },
      });

      const totalPages = Math.ceil(totalItems / defaultLimit);

      const queryBuilder = await this.filmsRepository.createQueryBuilder('film');
      joinWithCommonFields(queryBuilder, 'film.language', 'language', allcodeCommonFields);
      joinWithCommonFields(queryBuilder, 'film.age', 'age', allcodeCommonFields);
      joinWithCommonFields(queryBuilder, 'film.type', 'type', allcodeCommonFields);
      joinWithCommonFields(queryBuilder, 'film.country', 'country', allcodeCommonFields);
      joinWithCommonFields(queryBuilder, 'film.publicStatus', 'publicStatus', allcodeCommonFields);
      queryBuilder.leftJoinAndSelect('film.filmGenres', 'filmGenres');
      queryBuilder.leftJoinAndSelect('film.filmImages', 'filmImages');
      joinWithCommonFields(queryBuilder, 'filmGenres.genre', 'genre', allcodeCommonFields);

      const films = await queryBuilder
        .where('film.countryCode = :countryCode', { countryCode })
        .andWhere('film.deletedAt IS NULL')
        .orderBy('film.createdAt', 'DESC')
        .skip(offset)
        .take(defaultLimit)
        .getMany();

      if (films.length === 0) {
        return {
          EC: 0,
          EM: `No films found for country: ${countryValueEn}`,
          meta: {
            current: defaultPage,
            pageSize: defaultLimit,
            pages: totalPages,
            total: totalItems,
          },
          result: [],
        };
      }

      return {
        EC: 0,
        EM: 'Get films by country success',
        meta: {
          current: defaultPage,
          pageSize: defaultLimit,
          pages: totalPages,
          total: totalItems,
        },
        result: plainToInstance(FilmPaginationDto, films),
      };
    } catch (error) {
      console.error('Error in film service get films by country:', error.message);
      throw new InternalServerErrorException({
        EC: 5,
        EM: 'Error in film service get films by country',
      });
    }
  }

  async findByGenre(genreValueEn: string, page: number, limit: number) {
    try {
      if (!genreValueEn || genreValueEn.trim() === '') {
        throw new BadRequestException({
          EC: 1,
          EM: 'Genre value (valueEn) is required',
        });
      }

      const offset = (page - 1) * limit;
      const defaultLimit = limit ? limit : 10;
      const defaultPage = page ? page : 1;

      const allCodeRepository = this.filmsRepository.manager.getRepository('AllCode');
      const genre = await allCodeRepository.findOne({
        where: {
          valueEn: genreValueEn,
          type: 'GENRE',
        },
      });

      const genreCode = genre?.keyMap;

      console.log('[v0] Genre lookup - valueEn:', genreValueEn, 'genreCode:', genreCode);

      if (!genreCode) {
        return {
          EC: 0,
          EM: `No genre found with valueEn: ${genreValueEn}`,
          meta: {
            current: defaultPage,
            pageSize: defaultLimit,
            pages: 0,
            total: 0,
          },
          result: [],
        };
      }

      const totalItems = await this.filmsRepository
        .createQueryBuilder('film')
        .leftJoinAndSelect('film.filmGenres', 'filmGenres')
        .where('filmGenres.genreCode = :genreCode', { genreCode })
        .andWhere('film.deletedAt IS NULL')
        .getCount();

      const totalPages = Math.ceil(totalItems / defaultLimit);

      const queryBuilder = await this.filmsRepository.createQueryBuilder('film');
      joinWithCommonFields(queryBuilder, 'film.language', 'language', allcodeCommonFields);
      joinWithCommonFields(queryBuilder, 'film.age', 'age', allcodeCommonFields);
      joinWithCommonFields(queryBuilder, 'film.type', 'type', allcodeCommonFields);
      joinWithCommonFields(queryBuilder, 'film.country', 'country', allcodeCommonFields);
      joinWithCommonFields(queryBuilder, 'film.publicStatus', 'publicStatus', allcodeCommonFields);
      queryBuilder.leftJoinAndSelect('film.filmGenres', 'filmGenres');
      queryBuilder.leftJoinAndSelect('film.filmImages', 'filmImages');
      joinWithCommonFields(queryBuilder, 'filmGenres.genre', 'genre', allcodeCommonFields);

      const films = await queryBuilder
        .where('filmGenres.genreCode = :genreCode', { genreCode })
        .andWhere('film.deletedAt IS NULL')
        .orderBy('film.createdAt', 'DESC')
        .skip(offset)
        .take(defaultLimit)
        .getMany();

      console.log('[v0] Films found for genre', genreValueEn, ':', films.length);

      if (films.length === 0) {
        return {
          EC: 0,
          EM: `No films found for genre: ${genreValueEn}`,
          meta: {
            current: defaultPage,
            pageSize: defaultLimit,
            pages: totalPages,
            total: totalItems,
          },
          result: [],
        };
      }

      return {
        EC: 0,
        EM: 'Get films by genre success',
        meta: {
          current: defaultPage,
          pageSize: defaultLimit,
          pages: totalPages,
          total: totalItems,
        },
        result: plainToInstance(FilmPaginationDto, films),
      };
    } catch (error) {
      console.error('Error in film service get films by genre:', error.message);
      throw new InternalServerErrorException({
        EC: 5,
        EM: 'Error in film service get films by genre',
      });
    }
  }

  async findByType(typeValueEn: string, page: number, limit: number) {
    try {
      if (!typeValueEn || typeValueEn.trim() === '') {
        throw new BadRequestException({
          EC: 1,
          EM: 'Type value (valueEn) is required',
        });
      }

      const offset = (page - 1) * limit;
      const defaultLimit = limit ? limit : 10;
      const defaultPage = page ? page : 1;

      const allCodeRepository = this.filmsRepository.manager.getRepository('AllCode');
      const type = await allCodeRepository.findOne({
        where: {
          valueEn: typeValueEn,
          type: 'FILM_TYPE',
        },
      });

      const typeCode = type?.keyMap;

      console.log('[v0] Type lookup - valueEn:', typeValueEn, 'typeCode:', typeCode);

      if (!typeCode) {
        return {
          EC: 0,
          EM: `No type found with valueEn: ${typeValueEn}`,
          meta: {
            current: defaultPage,
            pageSize: defaultLimit,
            pages: 0,
            total: 0,
          },
          result: [],
        };
      }

      const totalItems = await this.filmsRepository.count({
        where: {
          typeCode,
        },
      });

      const totalPages = Math.ceil(totalItems / defaultLimit);

      const queryBuilder = await this.filmsRepository.createQueryBuilder('film');
      joinWithCommonFields(queryBuilder, 'film.language', 'language', allcodeCommonFields);
      joinWithCommonFields(queryBuilder, 'film.age', 'age', allcodeCommonFields);
      joinWithCommonFields(queryBuilder, 'film.type', 'type', allcodeCommonFields);
      joinWithCommonFields(queryBuilder, 'film.country', 'country', allcodeCommonFields);
      joinWithCommonFields(queryBuilder, 'film.publicStatus', 'publicStatus', allcodeCommonFields);
      queryBuilder.leftJoinAndSelect('film.filmGenres', 'filmGenres');
      queryBuilder.leftJoinAndSelect('film.filmImages', 'filmImages');
      joinWithCommonFields(queryBuilder, 'filmGenres.genre', 'genre', allcodeCommonFields);

      const films = await queryBuilder
        .where('film.typeCode = :typeCode', { typeCode })
        .andWhere('film.deletedAt IS NULL')
        .orderBy('film.createdAt', 'DESC')
        .skip(offset)
        .take(defaultLimit)
        .getMany();

      console.log('[v0] Films found for type', typeValueEn, ':', films.length);

      if (films.length === 0) {
        return {
          EC: 0,
          EM: `No films found for type: ${typeValueEn}`,
          meta: {
            current: defaultPage,
            pageSize: defaultLimit,
            pages: totalPages,
            total: totalItems,
          },
          result: [],
        };
      }

      return {
        EC: 0,
        EM: 'Get films by type success',
        meta: {
          current: defaultPage,
          pageSize: defaultLimit,
          pages: totalPages,
          total: totalItems,
        },
        result: plainToInstance(FilmPaginationDto, films),
      };
    } catch (error) {
      console.error('Error in film service get films by type:', error.message);
      throw new InternalServerErrorException({
        EC: 5,
        EM: 'Error in film service get films by type',
      });
    }
  }

  // async findWithFilters(
  //   filters: {
  //     country?: string;
  //     type?: string;
  //     rating?: string;
  //     genre?: string;
  //     version?: string;
  //     year?: string;
  //   },
  //   sort?: string,
  //   page: number = 1,
  //   limit: number = 10,
  // ) {
  //   try {
  //     const offset = (page - 1) * limit;
  //     const defaultLimit = limit ? limit : 10;
  //     const defaultPage = page ? page : 1;

  //     const queryBuilder = this.filmsRepository.createQueryBuilder('film');
  //     joinWithCommonFields(queryBuilder, 'film.language', 'language', allcodeCommonFields);
  //     joinWithCommonFields(queryBuilder, 'film.age', 'age', allcodeCommonFields);
  //     joinWithCommonFields(queryBuilder, 'film.type', 'type', allcodeCommonFields);
  //     joinWithCommonFields(queryBuilder, 'film.country', 'country', allcodeCommonFields);
  //     joinWithCommonFields(queryBuilder, 'film.publicStatus', 'publicStatus', allcodeCommonFields);
  //     queryBuilder.leftJoinAndSelect('film.filmGenres', 'filmGenres');
  //     queryBuilder.leftJoinAndSelect('film.filmImages', 'filmImages');
  //     joinWithCommonFields(queryBuilder, 'filmGenres.genre', 'genre', allcodeCommonFields);

  //     // Base condition: not deleted
  //     queryBuilder.where('film.deletedAt IS NULL');

  //     // Filter by country
  //     if (filters.country && filters.country.trim() !== '') {
  //       const countryValueEn = filters.country.trim();
  //       const countryCode = await this.getAllCodeKeyMap(countryValueEn, 'COUNTRY');
  //       if (countryCode) {
  //         queryBuilder.andWhere('film.countryCode = :countryCode', { countryCode });
  //       }
  //     }

  //     // Filter by type
  //     if (filters.type && filters.type.trim() !== '') {
  //       const typeValueEn = filters.type.trim();
  //       const typeCode = await this.getAllCodeKeyMap(typeValueEn, 'TYPE');
  //       if (typeCode) {
  //         queryBuilder.andWhere('film.typeCode = :typeCode', { typeCode });
  //       }
  //     }

  //     // Filter by rating (age rating)
  //     if (filters.rating && filters.rating.trim() !== '') {
  //       const ratingValueEn = filters.rating.trim();
  //       const ratingCode = await this.getAllCodeKeyMap(ratingValueEn, 'AGE');
  //       if (ratingCode) {
  //         queryBuilder.andWhere('film.ageCode = :ageCode', { ageCode: ratingCode });
  //       }
  //     }

  //     // Filter by genre(s) - support comma-separated values or array
  //     if (filters.genre && filters.genre.trim() !== '') {
  //       const genreList = filters.genre.split(',').map((g: string) => g.trim());
  //       const genreCodes: string[] = [];

  //       for (const genreValueEn of genreList) {
  //         const genreCode = await this.getAllCodeKeyMap(genreValueEn, 'GENRE');
  //         if (genreCode) {
  //           genreCodes.push(genreCode);
  //         }
  //       }

  //       if (genreCodes.length > 0) {
  //         queryBuilder.andWhere('filmGenres.genreCode IN (:...genreCodes)', { genreCodes });
  //       }
  //     }

  //     // Filter by version
  //     if (filters.version && filters.version.trim() !== '') {
  //       const versionValueEn = filters.version.trim();
  //       const versionCode = await this.getAllCodeKeyMap(versionValueEn, 'VERSION');
  //       if (versionCode) {
  //         queryBuilder.andWhere('film.versionCode = :versionCode', { versionCode });
  //       }
  //     }

  //     // Filter by year - support single year or range (e.g., "2023" or "2020-2023")
  //     if (filters.year && filters.year.trim() !== '') {
  //       const yearValue = filters.year.trim();
  //       if (yearValue.includes('-')) {
  //         const [startYear, endYear] = yearValue.split('-');
  //         queryBuilder.andWhere('film.year >= :startYear AND film.year <= :endYear', {
  //           startYear: startYear.trim(),
  //           endYear: endYear.trim(),
  //         });
  //       } else {
  //         queryBuilder.andWhere('film.year = :year', { year: yearValue });
  //       }
  //     }

  //     // Apply sorting
  //     if (sort) {
  //       switch (sort.toLowerCase()) {
  //         case 'latest':
  //           queryBuilder.orderBy('film.createdAt', 'DESC');
  //           break;
  //         case 'imdb':
  //           queryBuilder.orderBy('film.imdbScore', 'DESC');
  //           break;
  //         case 'views':
  //           queryBuilder.orderBy('film.view', 'DESC');
  //           break;
  //         case 'release_date':
  //           queryBuilder.orderBy('film.releaseDate', 'DESC');
  //           break;
  //         default:
  //           queryBuilder.orderBy('film.createdAt', 'DESC');
  //       }
  //     } else {
  //       queryBuilder.orderBy('film.createdAt', 'DESC');
  //     }

  //     // Get total count before pagination
  //     const totalItems = await queryBuilder.getCount();
  //     const totalPages = Math.ceil(totalItems / defaultLimit);

  //     // Apply pagination
  //     const films = await queryBuilder.skip(offset).take(defaultLimit).getMany();

  //     return {
  //       EC: 0,
  //       EM: 'Get films with filters success',
  //       meta: {
  //         current: defaultPage,
  //         pageSize: defaultLimit,
  //         pages: totalPages,
  //         total: totalItems,
  //       },
  //       result: plainToInstance(FilmPaginationDto, films),
  //     };
  //   } catch (error) {
  //     console.error('Error in film service get films with filters:', error.message);
  //     throw new InternalServerErrorException({
  //       EC: 5,
  //       EM: 'Error in film service get films with filters',
  //     });
  //   }
  // }

  async getAllCodeKeyMap(valueEn: string, type: string): Promise<string | null> {
    try {
      const allCodeRepository = this.filmsRepository.manager.getRepository('AllCode');
      const allCode = await allCodeRepository.findOne({
        where: {
          valueEn,
          type,
        },
      });
      return allCode?.keyMap || null;
    } catch (error) {
      console.log('Error in film service get all code key map: ', error || error.message);
      return null;
    }
  }
}
