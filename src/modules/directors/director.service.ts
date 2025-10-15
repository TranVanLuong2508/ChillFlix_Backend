import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Director } from './entities/director.entity';
import { AllCode } from 'src/modules/all-codes/entities/all-code.entity';
import { CreateDirectorDto } from './dto-director/create-director.dto';
import { UpdateDirectorDto } from './dto-director/update-director.dto';
import aqp from 'api-query-params';

@Injectable()
export class DirectorService {
  constructor(
    @InjectRepository(Director)
    private readonly directorRepo: Repository<Director>,

    @InjectRepository(AllCode)
    private readonly allcodeRepo: Repository<AllCode>,
  ) {}

  async createDirector(dto: CreateDirectorDto): Promise<any> {
    try {
      if (!dto.directorName?.trim()) {
        return { EC: 0, EM: 'Director name is required!' };
      }

      const gender = await this.allcodeRepo.findOne({
        where: { keyMap: dto.genderCode, type: 'GENDER' },
      });
      if (!gender) return { EC: 0, EM: `${dto.genderCode} is not valid!` };

      const nationality = await this.allcodeRepo.findOne({
        where: { keyMap: dto.nationalityCode, type: 'COUNTRY' },
      });
      if (!nationality) return { EC: 0, EM: `Nationality ${dto.nationalityCode} is not valid!` };

      const exists = await this.directorRepo.findOne({
        where: { directorName: dto.directorName },
      });
      if (exists) return { EC: 0, EM: 'Director name already exists!' };

      const slug = dto.directorName.toLowerCase().replace(/\s+/g, '-');

      const director = this.directorRepo.create({
        directorName: dto.directorName,
        slug,
        story: dto.story,
        avatarUrl: dto.avatarUrl,
        genderCodeRL: gender,
        nationalityCodeRL: nationality,
      });

      const result = await this.directorRepo.save(director);
      if (result.slug) result.slug = `${result.slug}.${result.directorId}`;

      return {
        EC: 1,
        EM: 'Create director successfully',
        ...result,
      };
    } catch (error: any) {
      console.error('Error in createDirector:', error);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from createDirector service',
      });
    }
  }

  async getAllDirectors(query: any): Promise<any> {
    try {
      const { filter, sort } = aqp(query);
      const page = query.page || 1;
      const limit = query.limit || 5;
      const skip = (page - 1) * limit;

      delete filter.page;
      delete filter.limit;
      delete filter.skip;
      delete filter.sort;

      const order = sort || { directorId: 'ASC' };

      const [data, total] = await this.directorRepo.findAndCount({
        relations: ['genderCodeRL', 'nationalityCodeRL'],
        select: {
          genderCodeRL: {
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
          EM: 'No directors found!',
          meta: { page, limit, total, totalPages: 0 },
        };
      data.forEach((director) => {
        if (director.slug) {
          director.slug = `${director.slug}.${director.directorId}`;
        }
      });
      return {
        EC: 1,
        EM: 'Get all directors successfully',
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        data,
      };
    } catch (error: any) {
      console.error('Error in getAllDirectors:', error);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from getAllDirectors service',
      });
    }
  }

  async getDirectorById(id: number): Promise<any> {
    try {
      const director = await this.directorRepo.findOne({
        where: { directorId: id },
        relations: ['genderCodeRL', 'nationalityCodeRL'],
      });

      if (!director) return { EC: 0, EM: `Director ${id} not found!` };

      if (director.slug) director.slug = `${director.slug}.${director.directorId}`;
      return {
        EC: 1,
        EM: 'Get director successfully',
        ...director,
      };
    } catch (error: any) {
      console.error('Error in getDirectorById:', error);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from getDirectorById service',
      });
    }
  }

  async updateDirector(id: number, dto: UpdateDirectorDto): Promise<any> {
    try {
      const director = await this.directorRepo.findOne({
        where: { directorId: id },
        relations: ['genderCodeRL', 'nationalityCodeRL'],
      });

      if (!director) return { EC: 0, EM: `Director ${id} not found!` };

      if (dto.directorName) {
        const exists = await this.directorRepo.findOne({
          where: { directorName: dto.directorName },
        });
        if (exists && exists.directorId !== id) return { EC: 0, EM: 'Director name already exists!' };

        director.directorName = dto.directorName;
        director.slug = dto.directorName.toLowerCase().replace(/\s+/g, '-');
      }

      if (dto.story) director.story = dto.story;
      if (dto.avatarUrl) director.avatarUrl = dto.avatarUrl;

      if (dto.genderCode) {
        const gender = await this.allcodeRepo.findOne({
          where: { keyMap: dto.genderCode, type: 'GENDER' },
        });
        if (!gender) return { EC: 0, EM: `${dto.genderCode} is not valid!` };
        director.genderCodeRL = gender;
      }

      if (dto.nationalityCode) {
        const nationality = await this.allcodeRepo.findOne({
          where: { keyMap: dto.nationalityCode, type: 'COUNTRY' },
        });
        if (!nationality) return { EC: 0, EM: `Nationality ${dto.nationalityCode} is not valid!` };
        director.nationalityCodeRL = nationality;
      }

      const result = await this.directorRepo.save(director);
      if (result.slug) result.slug = `${result.slug}.${result.directorId}`;
      return {
        EC: 1,
        EM: 'Update director successfully',
        ...result,
      };
    } catch (error: any) {
      console.error('Error in updateDirector:', error);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from updateDirector service',
      });
    }
  }

  async deleteDirectorById(id: number): Promise<any> {
    try {
      const director = await this.directorRepo.findOne({
        where: { directorId: id },
      });
      if (!director) return { EC: 0, EM: `Director ${id} not found!` };

      await this.directorRepo.remove(director);
      return { EC: 1, EM: 'Delete director successfully' };
    } catch (error: any) {
      console.error('Error in deleteDirectorById:', error);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from deleteDirectorById service',
      });
    }
  }
}
