import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Actor } from './entities/actor.entity';
import { AllCode } from '../all-codes/entities/all-code.entity';
import { CreateActorDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';
import aqp from 'api-query-params';

@Injectable()
export class ActorService {
  constructor(
    @InjectRepository(Actor)
    private readonly actorRepo: Repository<Actor>,

    @InjectRepository(AllCode)
    private readonly allcodeRepo: Repository<AllCode>,
  ) {}

  async createActor(dto: CreateActorDto): Promise<any> {
    try {
      const gender = await this.allcodeRepo.findOne({
        where: { keyMap: dto.genderCode, type: 'GENDER' },
      });
      if (!gender) return { EC: 0, EM: `${dto.genderCode} is not valid!` };

      const nationality = await this.allcodeRepo.findOne({
        where: { keyMap: dto.nationalityCode, type: 'COUNTRY' },
      });
      if (!nationality) return { EC: 0, EM: `Nationality ${dto.nationalityCode} is not valid!` };

      if (!dto.actorName || dto.actorName.trim() === '') return { EC: 0, EM: 'Actor name is required!' };

      const exists = await this.actorRepo.findOne({
        where: { actorName: dto.actorName },
      });
      if (exists) return { EC: 0, EM: 'Actor name already exists!' };

      const slug = dto.actorName.toLowerCase().replace(/\s+/g, '-');
      let formattedDate: any = dto.birthDate;

      if (typeof dto.birthDate === 'string' && (dto.birthDate as string).includes('/')) {
        formattedDate = (dto.birthDate as string).split('/').reverse().join('-');
      }

      const actor = this.actorRepo.create({
        actorName: dto.actorName,
        slug,
        genderActor: gender,
        avatarUrl: dto.avatarUrl,
        birthDate: dto.birthDate ? new Date(formattedDate) : undefined,
        nationalityActor: nationality,
      });

      const result = await this.actorRepo.save(actor);

      return {
        EC: 1,
        EM: 'Create actor successfully',
        ...result,
      };
    } catch (error: any) {
      console.error('Error in createActor:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from createActor service',
      });
    }
  }

  async getAllActors(query: any) {
    try {
      const { filter, sort } = aqp(query);
      const page = query.page || 1;
      const limit = query.limit || 5;
      const skip = (page - 1) * limit;

      delete filter.page;
      delete filter.limit;
      delete filter.skip;
      delete filter.sort;

      const order = sort || { actorId: 'ASC' };

      const [data, total] = await this.actorRepo.findAndCount({
        relations: ['genderActor', 'nationalityActor'],
        select: {
          genderActor: {
            keyMap: true,
            valueEn: true,
            valueVi: true,
            description: true,
          },
        },
        where: filter,
        order,
        skip,
        take: limit,
      });
      if (total === 0)
        return {
          EC: 1,
          EM: 'No actors found',
          meta: { page, limit, total, totalPages: 0 },
        };
      data.forEach((actor) => {
        if (actor.slug) {
          actor.slug = `${actor.slug}.${actor.actorId}`;
        }
      });
      return {
        EC: 1,
        EM: 'Get all actors successfully',
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        data,
      };
    } catch (error: any) {
      console.error('Error in getAllActors:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from getAllActors service',
      });
    }
  }

  async getActorById(actorId: number): Promise<any> {
    try {
      const actor = await this.actorRepo.findOne({
        where: { actorId },
        relations: ['genderActor', 'nationalityActor'],
      });
      if (!actor) return { EC: 0, EM: `Actor ${actorId} not found` };
      if (actor.slug) actor.slug = `${actor.slug}.${actor.actorId}`;
      return { EC: 1, EM: 'Get actor successfully', ...actor };
    } catch (error: any) {
      console.error('Error in getActorById:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from getActorById service',
      });
    }
  }

  async updateActor(actorId: number, dto: UpdateActorDto): Promise<any> {
    try {
      const actor = await this.actorRepo.findOne({
        where: { actorId },
        relations: ['genderActor', 'nationalityActor'],
      });
      if (!actor) return { EC: 0, EM: `Actor ${actorId} not found!` };

      if (dto.actorName) {
        const exists = await this.actorRepo.findOne({
          where: { actorName: dto.actorName },
        });
        if (exists && exists.actorId !== actorId) return { EC: 0, EM: 'Actor name already exists!' };

        actor.actorName = dto.actorName;
        actor.slug = dto.actorName.toLowerCase().replace(/\s+/g, '-');
      }

      if (dto.genderCode) {
        const gender = await this.allcodeRepo.findOne({
          where: { keyMap: dto.genderCode, type: 'GENDER' },
        });
        if (!gender) return { EC: 0, EM: `${dto.genderCode} is not valid!` };
        actor.genderActor = gender;
      }

      if (dto.nationalityCode) {
        const nationality = await this.allcodeRepo.findOne({
          where: { keyMap: dto.nationalityCode, type: 'COUNTRY' },
        });
        if (!nationality) return { EC: 0, EM: `Nationality ${dto.nationalityCode} is not valid!` };
        actor.nationalityActor = nationality;
      }

      if (dto.avatarUrl) actor.avatarUrl = dto.avatarUrl;
      let formattedDate: any = dto.birthDate;
      if (dto.birthDate) {
        if (typeof dto.birthDate === 'string' && (dto.birthDate as string).includes('/')) {
          formattedDate = (dto.birthDate as string).split('/').reverse().join('-');
        }
        actor.birthDate = new Date(formattedDate);
      }
      const result = await this.actorRepo.save(actor);

      return { EC: 1, EM: 'Update actor successfully', ...result };
    } catch (error: any) {
      console.error('Error in updateActor:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from updateActor service',
      });
    }
  }

  async deleteActorById(actorId: number) {
    try {
      const actor = await this.actorRepo.findOne({ where: { actorId } });
      if (!actor) return { EC: 0, EM: `Actor ${actorId} not found!` };

      await this.actorRepo.remove(actor);
      return { EC: 1, EM: 'Delete actor successfully' };
    } catch (error: any) {
      console.error('Error in deleteActorById:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from deleteActorById service',
      });
    }
  }
}
