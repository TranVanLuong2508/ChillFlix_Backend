import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDirectorDto } from './dto-director/create-director.dto';
import { UpdateDirectorDto } from './dto-director/update-director.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Director } from './entities/director.entity';
import { AllCode } from 'src/modules/all-codes/entities/all-code.entity';

@Injectable()
export class DirectorService {
  constructor(
    @InjectRepository(Director)
    private readonly directRepo: Repository<Director>,
    @InjectRepository(AllCode)
    private readonly allcodeRepo: Repository<AllCode>,
  ) {}

  async createDirector(dto: CreateDirectorDto): Promise<any> {
    const gender = await this.allcodeRepo.findOne({
      where: { keyMap: dto.genderCode, type: 'GENDER' },
    });
    if (!gender) {
      throw new BadRequestException(`${dto.genderCode} is not valid!`);
    }

    let nationality = await this.allcodeRepo.findOne({
      where: { keyMap: dto.nationalityCode, type: 'COUNTRY' },
    });
    if (!nationality) {
      throw new BadRequestException(`Nationality ${dto.nationalityCode} not valid!`);
    }

    const director = this.directRepo.create({
      directorName: dto.directorName,
      genderCodeRL: gender,
      story: dto.story,
      avatarUrl: dto.avatarUrl,
      nationalityCodeRL: nationality,
    });
    if (director.directorName === '') {
      throw new BadRequestException('Director name is required!');
    }
    const exists = await this.directRepo.findOne({
      where: { directorName: dto.directorName },
    });
    if (exists) {
      throw new BadRequestException('Director already exists!');
    }
    const result = await this.directRepo.save(director);
    return { EC: 0, EM: 'Create director successfully', result };
  }

  async getDirectors({ filter, sort, skip, limit }: any) {
    delete filter.page;
    delete filter.limit;
    delete filter.skip;
    delete filter.sort;

    const order: any = {};
    for (const key in sort) {
      order[key] = sort[key] === -1 ? 'DESC' : 'ASC';
    }

    const data = await this.directRepo.findAndCount({
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

    if (data[1] === 0) {
      throw new NotFoundException('Director not found!');
    }
    return { EC: 0, EM: 'Get directors successfully', data };
  }

  async getDirectorById(id: number): Promise<any> {
    const director = await this.directRepo.findOne({
      where: { directorId: id },
      relations: ['genderCodeRL', 'nationalityCodeRL'],
    });
    if (!director) {
      throw new NotFoundException('Director not found!');
    }
    return { EC: 0, EM: 'Get director successfully', director };
  }

  async editDirector(id: number, dto: UpdateDirectorDto): Promise<any> {
    const director = await this.directRepo.findOne({
      where: { directorId: id },
      relations: ['genderCodeRL', 'nationalityCodeRL'],
    });
    if (!director) {
      throw new NotFoundException(`Director ${id} not found!`);
    }

    if (dto.genderCode) {
      const gender = await this.allcodeRepo.findOne({
        where: { keyMap: dto.genderCode, type: 'GENDER' },
      });
      if (!gender) {
        throw new BadRequestException(` ${dto.genderCode} is not valid!`);
      }
      director.genderCodeRL = gender;
    }

    if (dto.nationalityCode) {
      const nationality = await this.allcodeRepo.findOne({
        where: { keyMap: dto.nationalityCode, type: 'COUNTRY' },
      });
      if (!nationality) {
        throw new BadRequestException(`Nationality ${dto.nationalityCode} is not valid!`);
      }
      director.nationalityCodeRL = nationality;
    }

    if (dto.directorName) {
      const exists = await this.directRepo.findOne({
        where: { directorName: dto.directorName },
      });
      if (exists && exists.directorId !== id) {
        throw new BadRequestException('Director name already exists!');
      }
      director.directorName = dto.directorName;
    }

    if (dto.story) director.story = dto.story;
    if (dto.avatarUrl) director.avatarUrl = dto.avatarUrl;

    const result = await this.directRepo.save(director);
    return { EC: 0, EM: 'Update director successfully', result };
  }

  async deleteDirector(id: number): Promise<any> {
    const director = await this.directRepo.findOne({
      where: { directorId: id },
      select: { directorName: true },
    });
    if (!director) {
      throw new NotFoundException('Director not found!');
    }
    await this.directRepo.delete({ directorId: id });
    return { EC: 0, EM: 'Delete director successfully' };
  }

  async deleteAllDirectors(): Promise<any> {
    await this.directRepo.clear();
    return { EC: 0, EM: 'Delete all directors successfully' };
  }
}
