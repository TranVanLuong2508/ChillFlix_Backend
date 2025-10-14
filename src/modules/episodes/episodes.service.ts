import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';
import { IUser } from '../users/interface/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Episode } from './entities/episode.entity';
import { Repository } from 'typeorm';
import { Part } from '../parts/entities/part.entity';
import { isEmpty, isUUID } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { EpisodeFindOne } from './dto/episode-response.dto';
import aqp from 'api-query-params';

@Injectable()
export class EpisodesService {
  constructor(
    @InjectRepository(Episode) private episodeRepository: Repository<Episode>,
    @InjectRepository(Part) private partRepository: Repository<Part>,
  ) {}

  async create(createEpisodeDto: CreateEpisodeDto, user: IUser) {
    const partIsExist = await this.partRepository.exists({ where: { id: createEpisodeDto.partId } });

    if (!partIsExist) {
      throw new NotFoundException(`Part with id ${createEpisodeDto.partId} not found`);
    }

    if (!createEpisodeDto.title) {
      createEpisodeDto.title = `Tập ${createEpisodeDto.episodeNumber}`;
    }

    const newEpisode = this.episodeRepository.create({ ...createEpisodeDto, createdBy: user.userId.toString() });
    await this.episodeRepository.save(newEpisode);
    return {
      id: newEpisode.id,
      createdAt: newEpisode.createdAt,
    };
  }

  async findAll(page: number, limit: number, qs: string) {
    const { filter, projection } = aqp(qs);
    let { sort } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    if (isEmpty(sort)) {
      sort = { createdAt: -1 };
    }

    const offset = (page - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    const totalItems = await this.episodeRepository.count({ where: filter });
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.episodeRepository.find({
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
      result: plainToInstance(EpisodeFindOne, result),
    };
  }

  async findOne(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Wrong format episode id!`);
    }

    const episode = await this.episodeRepository.findOne({ where: { id }, relations: ['part'] });
    console.log('>>>Check: ', episode);

    if (!episode) {
      throw new NotFoundException(`Episode with id: ${id} not found`);
    }

    return plainToInstance(EpisodeFindOne, episode);
  }

  async update(id: string, updateEpisodeDto: UpdateEpisodeDto, user: IUser) {
    if (!isUUID(id)) {
      throw new BadRequestException('Wrong format episode id!');
    }

    const episodeData = await this.episodeRepository.findOneBy({ id });
    if (!episodeData) {
      throw new NotFoundException(`Episode with id: ${id} not found`);
    }

    Object.assign(episodeData, updateEpisodeDto);
    episodeData.updatedBy = user.userId.toString();

    try {
      await this.episodeRepository.save(episodeData);
      return {
        message: 'Update Episode successful',
        affectedRows: 1,
      };
    } catch (error) {
      throw new InternalServerErrorException(error || error.message);
    }
  }

  async remove(id: string, user: IUser) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Wrong format episode id!`);
    }

    const episodeIsExist = await this.episodeRepository.exists({ where: { id } });
    if (!episodeIsExist) {
      throw new NotFoundException(`Episode with id ${id} not found`);
    }

    await this.episodeRepository.update(id, { deletedBy: user.userId.toString() });
    await this.episodeRepository.softDelete(id);
    return { deleted: 'success' };
  }
}
