import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCoWatchingDto } from './dto/create-co-watching.dto';
import { UpdateCoWatchingDto } from './dto/update-co-watching.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomCoWatching } from './entities/co-watching.entity';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import aqp from 'api-query-params';
import { isEmpty, isUUID } from 'class-validator';

@Injectable()
export class CoWatchingService {
  private readonly REDIS_TTL = 86400;
  private readonly REDIS_PREFIX = 'room:';

  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(RoomCoWatching)
    private readonly coWatchingRepository: Repository<RoomCoWatching>,
  ) {}

  async create(createCoWatchingDto: CreateCoWatchingDto) {
    try {
      const roomData = this.coWatchingRepository.create({ ...createCoWatchingDto });
      const newRoom = await this.coWatchingRepository.save(roomData);

      const roomWithRelations = await this.coWatchingRepository.findOne({
        where: { roomId: newRoom.roomId },
        relations: ['episode', 'episode.part', 'episode.part.film'],
      });

      await this.redisService.setJson(
        this.REDIS_PREFIX + newRoom.roomId,
        roomWithRelations,
        this.REDIS_TTL,
      );

      return {
        EC: 0,
        EM: 'Create new film success',
        roomId: newRoom.roomId,
        createdAt: newRoom.createdAt,
      };
    } catch (error) {
      console.error(
        'Error in co-watching service create new room co_watching:',
        error || error.message,
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error in co-watching service create new room co_watching ',
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

      const totalItems = await this.coWatchingRepository.count({ where: filter });
      const totalPages = Math.ceil(totalItems / defaultLimit);

      const result = await this.coWatchingRepository.find({
        where: filter,
        order: sort,
        skip: offset,
        take: defaultLimit,
      });

      return {
        EC: 0,
        EM: 'Get co_watching room with query paginate success',
        meta: {
          current: page,
          pageSize: limit,
          pages: totalPages,
          total: totalItems,
        },
        result,
      };
    } catch (error) {
      console.error(
        'Error in co-watching service get list room co_watching:',
        error || error.message,
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error in co-watching service get list room co_watching',
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

      const cacheKey = this.REDIS_PREFIX + id;
      const cached = await this.redisService.getJson<RoomCoWatching>(cacheKey);
      if (cached) {
        return {
          EC: 0,
          EM: 'Get room by id success',
          data: cached,
        };
      }

      const roomData = await this.coWatchingRepository.findOne({
        where: { roomId: id },
        relations: ['episode', 'episode.part', 'episode.part.film'],
      });
      if (!roomData) {
        throw new NotFoundException({
          EC: 2,
          EM: `Cannot find room with id: ${id}`,
        });
      }

      await this.redisService.setJson(cacheKey, roomData, this.REDIS_TTL);

      return {
        EC: 0,
        EM: 'Get room by id success',
        data: roomData,
      };
    } catch (error) {
      console.error(
        'Error in co-watching service get room co_watching by Id:',
        error || error.message,
      );
      throw new InternalServerErrorException({
        EC: 3,
        EM: 'Error in co-watching service get room co_watching by Id',
      });
    }
  }

  async update(roomId: string, updateCoWatchingDto: UpdateCoWatchingDto) {
    try {
      if (!isUUID(roomId)) {
        throw new BadRequestException({
          EC: 1,
          EM: `Invalid UUID format: ${roomId}`,
        });
      }
      const cacheKey = this.REDIS_PREFIX + roomId;

      await this.coWatchingRepository.update({ roomId }, updateCoWatchingDto);

      await this.redisService.del(cacheKey);

      const updatedRoom = await this.coWatchingRepository.findOneBy({ roomId });
      if (updatedRoom) {
        await this.redisService.setJson(cacheKey, updatedRoom, this.REDIS_TTL);
      }

      return {
        EC: 0,
        EM: 'Get room by id success',
        data: updatedRoom,
      };
    } catch (error) {
      console.error(
        'Error in co-watching service update room co_watching by Id:',
        error || error.message,
      );
      throw new InternalServerErrorException({
        EC: 2,
        EM: 'Error in co-watching service update room co_watching by Id',
      });
    }
  }

  async remove(roomId: string) {
    try {
      if (!isUUID(roomId)) {
        throw new BadRequestException({
          EC: 1,
          EM: `Invalid UUID format: ${roomId}`,
        });
      }
      const cacheKey = this.REDIS_PREFIX + roomId;

      await this.redisService.del(cacheKey);
      await this.coWatchingRepository.softDelete(roomId);

      return { EC: 0, EM: 'Delet room success', deleted: 'success' };
    } catch (error) {
      console.log('Error in co-watching service delete room: ', error || error.message);
      throw new InternalServerErrorException({
        EC: 2,
        EM: 'Error in co-watching service delete room',
      });
    }
  }
}
