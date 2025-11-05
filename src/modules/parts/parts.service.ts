import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { IUser } from '../users/interface/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Part } from './entities/part.entity';
import { Repository } from 'typeorm';
import { Film } from '../films/entities/film.entity';
import { isUUID } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PartResponseFindAllByFilmId, PartResponseUser } from './dto/part-response.dto';

@Injectable()
export class PartsService {
  constructor(
    @InjectRepository(Part) private partRepository: Repository<Part>,
    @InjectRepository(Film) private filmRepository: Repository<Film>,
  ) {}

  async create(createPartDto: CreatePartDto, user: IUser) {
    try {
      const filmIsExist = await this.filmRepository.exists({ where: { filmId: createPartDto.filmId } });

      if (!filmIsExist) {
        throw new NotFoundException({
          EC: 1,
          EM: `Film with id ${createPartDto.filmId} not found`,
        });
      }

      if (!createPartDto.title) {
        createPartDto.title = `Part ${createPartDto.partNumber}`;
      }

      const newPart = this.partRepository.create({ ...createPartDto, createdBy: user.userId.toString() });
      await this.partRepository.save(newPart);

      return {
        EC: 0,
        EM: 'Create new part success',
        id: newPart.id,
        createAt: newPart.createdAt,
      };
    } catch (error) {
      console.error('Error in part service create new part:', error || error.message);
      throw new InternalServerErrorException({
        EC: 2,
        EM: 'Error in part service create new part',
      });
    }
  }

  async findAll(filmId: string) {
    try {
      if (!isUUID(filmId)) {
        throw new BadRequestException({
          EC: 1,
          EM: `Wrong format film id!`,
        });
      }

      const result = await this.partRepository.find({ where: { filmId }, relations: ['episodes'] });
      return {
        EC: 0,
        EM: 'Get all part success',
        partData: plainToInstance(PartResponseFindAllByFilmId, result),
      };
    } catch (error) {
      console.error('Error in part service find all part by filmId:', error || error.message);
      throw new InternalServerErrorException({
        EC: 2,
        EM: 'Error in part service find all part by filmId',
      });
    }
  }

  async findOne(id: string) {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException({
          EC: 1,
          EM: `Wrong format part id!`,
        });
      }

      const part = await this.partRepository.findOne({ where: { id }, relations: ['episodes'] });
      if (!part) {
        throw new NotFoundException({
          EC: 2,
          EM: `Part with id: ${id} not found`,
        });
      }

      return {
        EC: 0,
        EM: 'Get part data success',
        part: plainToInstance(PartResponseUser, part),
      };
    } catch (error) {
      console.error('Error in part service find one part by partId:', error || error.message);
      throw new InternalServerErrorException({
        EC: 3,
        EM: 'Error in part service find one part by partId',
      });
    }
  }

  async update(id: string, updatePartDto: UpdatePartDto, user: IUser) {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException({ EC: 1, EM: `Wrong format part id!` });
      }

      const partData = await this.partRepository.findOneBy({ id });
      if (!partData) {
        throw new NotFoundException({ EC: 2, EM: `Film with id ${id} not found` });
      }

      Object.assign(partData, updatePartDto);
      partData.updatedBy = user.userId.toString();
      await this.partRepository.save(partData);
      return {
        EC: 0,
        EM: 'Update part success',
        message: 'Update Part success',
        affectedRows: 1,
      };
    } catch (error) {
      console.error('Error in part service update part:', error || error.message);
      throw new InternalServerErrorException({
        EC: 3,
        EM: 'Error in part service update part',
      });
    }
  }

  async remove(id: string, user: IUser) {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException({ EC: 1, EM: `Wrong format part id!` });
      }

      const partIsExist = await this.partRepository.exists({ where: { id } });
      if (!partIsExist) {
        throw new NotFoundException({ EC: 2, EM: `Part with id ${id} not found` });
      }

      await this.partRepository.update(id, { deletedBy: user.userId.toString() });
      await this.partRepository.softDelete(id);
      return { EC: 0, EM: 'Delete part success', deleted: 'success' };
    } catch (error) {
      console.error('Error in part service delete part:', error || error.message);
      throw new InternalServerErrorException({
        EC: 3,
        EM: 'Error in part service delete part',
      });
    }
  }
}
