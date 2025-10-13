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
import { PartResponseFindAll, PartResponseUser } from './dto/part-response.dto';

@Injectable()
export class PartsService {
  constructor(
    @InjectRepository(Part) private partRepository: Repository<Part>,
    @InjectRepository(Film) private filmRepository: Repository<Film>,
  ) {}

  async create(createPartDto: CreatePartDto, user: IUser) {
    const filmIsExist = await this.filmRepository.exists({ where: { id: createPartDto.filmId } });

    if (!filmIsExist) {
      throw new NotFoundException(`Film with id ${createPartDto.filmId} not found`);
    }

    if ('title' in createPartDto) {
      createPartDto.title = `Part ${createPartDto.partNumber}`;
    }
    const newPart = this.partRepository.create({ ...createPartDto, createdBy: user.userId.toString() });
    await this.partRepository.save(newPart);

    return {
      id: newPart.id,
      createAt: newPart.createdAt,
    };
  }

  async findAll(filmId: string) {
    if (!isUUID(filmId)) {
      throw new BadRequestException(`Wrong format film id!`);
    }

    const result = await this.partRepository.find({ where: { filmId }, relations: ['episodes'] });
    return plainToInstance(PartResponseFindAll, result);
  }

  async findOne(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Wrong format part id!`);
    }

    const part = await this.partRepository.findOne({ where: { id }, relations: ['episodes'] });

    return plainToInstance(PartResponseUser, part);
  }

  async update(id: string, updatePartDto: UpdatePartDto, user: IUser) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Wrong format part id!`);
    }

    const partData = await this.partRepository.findOneBy({ id });
    if (!partData) {
      throw new NotFoundException(`Film with id ${id} not found`);
    }

    Object.assign(partData, updatePartDto);
    partData.updatedBy = user.userId.toString();
    try {
      await this.partRepository.save(partData);
      return {
        message: 'Update Part successful',
        affectedRows: 1,
      };
    } catch (error) {
      throw new InternalServerErrorException(error || error.message);
    }
  }

  async remove(id: string, user: IUser) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Wrong format part id!`);
    }

    const partIsExist = await this.partRepository.exists({ where: { id } });
    if (!partIsExist) {
      throw new NotFoundException(`Film with id ${id} not found`);
    }

    await this.partRepository.update(id, { deletedBy: user.userId.toString() });
    await this.partRepository.softDelete(id);
    return { deleted: 'success' };
  }
}
