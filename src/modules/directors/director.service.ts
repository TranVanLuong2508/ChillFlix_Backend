import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Director } from './entities/director.entity';
import { AllCode } from 'src/modules/all-codes/entities/all-code.entity';
import { CreateDirectorDto } from './dto-director/create-director.dto';
import { UpdateDirectorDto } from './dto-director/update-director.dto';
import aqp from 'api-query-params';
import { IUser } from '../users/interface/user.interface';
import { DirectorSearchService } from '../search/directorSearch.service';
import { ActorSearchService } from '../search/actorSearch.service';

@Injectable()
export class DirectorService {
  constructor(
    @InjectRepository(Director)
    private readonly directorRepo: Repository<Director>,

    @InjectRepository(AllCode)
    private readonly allcodeRepo: Repository<AllCode>,

    private searchService: DirectorSearchService,
    private commonSearchService: ActorSearchService,
  ) {}

  async createDirector(dto: CreateDirectorDto, user: IUser): Promise<any> {
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
        slug: slug,
        birthDate: dto.birthDate,
        story: dto.story,
        avatarUrl: dto.avatarUrl,
        createdBy: user.userId,
        genderCodeRL: gender,
        nationalityCodeRL: nationality,
      });

      const data = await this.directorRepo.save(director);
      // search
      await this.searchService.indexDirector(director);
      // search
      const result = Object.fromEntries(
        Object.entries(data)
          .map(([k, v]) =>
            typeof v === 'object' && v !== null && 'keyMap' in v
              ? [
                  k,
                  {
                    keyMap: (v as any).keyMap,
                    type: (v as any).type,
                    valueEn: (v as any).valueEn,
                    valueVi: (v as any).valueVi,
                    description: (v as any).description,
                  },
                ]
              : [k, v],
          )
          .filter(([_, v]) => v !== null),
      );
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
      const directors = data.map((d) => {
        const slug = d.slug;
        const { createdAt, updatedAt, createdBy, ...newData } = d as any;

        const genderCodeRL = newData.genderCodeRL
          ? {
              keyMap: newData.genderCodeRL.keyMap,
              type: newData.genderCodeRL.type,
              valueEn: newData.genderCodeRL.valueEn,
              valueVi: newData.genderCodeRL.valueVi,
              description: newData.genderCodeRL.description,
            }
          : null;

        const nationalityCodeRL = newData.nationalityCodeRL
          ? {
              keyMap: newData.nationalityCodeRL.keyMap,
              type: newData.nationalityCodeRL.type,
              valueEn: newData.nationalityCodeRL.valueEn,
              valueVi: newData.nationalityCodeRL.valueVi,
              description: newData.nationalityCodeRL.description,
            }
          : null;

        return Object.fromEntries(
          Object.entries({
            ...newData,
            slug,
            genderCodeRL,
            nationalityCodeRL,
          }).filter(([_, v]) => v !== null),
        );
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
        directors,
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
      const { createdAt, updatedAt, createdBy, ...newData } = director as any;
      Object.entries(director).forEach(([k, v]) => {
        if (typeof v === 'object' && v !== null && 'keyMap' in v) {
          newData[k] = {
            keyMap: v.keyMap,
            type: v.type,
            valueEn: v.valueEn,
            valueVi: v.valueVi,
            description: v.description,
          };
        }
      });
      Object.entries(newData)
        .filter(([_, v]) => v === null || v === undefined)
        .forEach(([k]) => delete newData[k]);
      return {
        EC: 1,
        EM: 'Get director successfully',
        ...newData,
      };
    } catch (error: any) {
      console.error('Error in getDirectorById:', error);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from getDirectorById service',
      });
    }
  }

  async updateDirector(id: number, dto: UpdateDirectorDto, user: IUser): Promise<any> {
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
        if (exists && exists.directorId !== id)
          return { EC: 0, EM: 'Director name already exists!' };

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
      const d = dto.birthDate as any;
      director.birthDate = new Date(
        typeof d === 'string' && d.includes('/') ? d.split('/').reverse().join('-') : d,
      );

      director.updatedBy = user.userId;
      const data = await this.directorRepo.save(director);

      // search
      await this.commonSearchService.updateDocument(data.directorId.toString(), data, 'directors');
      // search

      const result = Object.fromEntries(
        Object.entries(data)
          .map(([k, v]) =>
            typeof v === 'object' && v?.keyMap
              ? [
                  k,
                  {
                    keyMap: v.keyMap,
                    type: v.type,
                    valueEn: v.valueEn,
                    valueVi: v.valueVi,
                    description: v.description,
                  },
                ]
              : [k, v],
          )
          .filter(([_, v]) => v !== null),
      );
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

  async deleteDirectorById(directorId: number, user: IUser): Promise<any> {
    try {
      const director = await this.directorRepo.findOne({
        where: { directorId },
      });
      if (!director) return { EC: 0, EM: `Director ${directorId} not found!` };
      await this.directorRepo.update(directorId, { deletedBy: user.userId });
      await this.directorRepo.softDelete({ directorId });
      // search
      await this.commonSearchService.removeFromIndex(director.directorId.toString(), 'directors');
      // search

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
