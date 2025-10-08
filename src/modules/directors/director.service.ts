import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDirectorDto } from '../dto-director/create-director.dto';
import { UpdateDirectorDto } from '../dto-director/update-director.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Director } from './director.entity';
import { AllCodes } from 'src/modules/allcodes/entities/allcodes.entity';

@Injectable()
export class DirectorService {
  constructor(
    @InjectRepository(Director)
    private readonly directRepo: Repository<Director>,
    @InjectRepository(AllCodes)
    private readonly allcodeRepo: Repository<AllCodes>,
  ) {}

  async createDirector(dto: CreateDirectorDto): Promise<Director> {
    const gender = await this.allcodeRepo.findOne({
      where: { keyMap: dto.gender, type: 'GENDER' },
    });
    if (!gender) {
      throw new BadRequestException(`${dto.gender} không hợp lệ!`);
    }

    let nationality = await this.allcodeRepo.findOne({
      where: { keyMap: dto.nationality, type: 'COUNTRY' },
    });
    if (!nationality) {
      throw new BadRequestException(`Quốc tịch này không hợp lệ!`);
    }

    const director = this.directRepo.create({
      directorName: dto.directorName,
      gender,
      story: dto.story,
      avatarUrl: dto.avatarUrl,
      nationality,
    });
    if (director.directorName === '') {
      throw new BadRequestException('Tên đạo diễn không được để trống!');
    }
    const exists = await this.directRepo.findOne({
      where: { directorName: dto.directorName },
    });
    if (exists) {
      throw new BadRequestException('Đạo diễn đã tồn tại!');
    }
    return await this.directRepo.save(director);
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

    const [data, total] = await this.directRepo.findAndCount({
      relations: ['gender'],
      select: {
        gender: {
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

    if (data.length === 0) {
      throw new NotFoundException('Không tìm thấy đạo diễn nào!');
    }
    return { data, total };
  }

  async getDirectorById(id: number): Promise<Director> {
    const director = await this.directRepo.findOne({
      where: { directorId: id },
      relations: ['gender'],
    });
    if (!director) {
      throw new NotFoundException('Không tìm thấy đạo diễn!');
    }
    return director;
  }

  async editDirector(id: number, dto: UpdateDirectorDto): Promise<Director> {
    const director = await this.directRepo.findOne({
      where: { directorId: id },
      relations: ['gender', 'nationality'],
    });
    if (!director) {
      throw new NotFoundException(`Không tìm thấy đạo diễn với ${id}`);
    }

    if (dto.gender) {
      const gender = await this.allcodeRepo.findOne({
        where: { keyMap: dto.gender, type: 'GENDER' },
      });
      if (!gender) {
        throw new BadRequestException(
          `Giá trị gender = ${dto.gender} không hợp lệ!`,
        );
      }
      director.gender = gender;
    }

    if (dto.nationality) {
      const nationality = await this.allcodeRepo.findOne({
        where: { keyMap: dto.nationality, type: 'COUNTRY' },
      });
      if (!nationality) {
        throw new BadRequestException(
          `Quốc tịch ${dto.nationality} không hợp lệ!`,
        );
      }
      director.nationality = nationality;
    }

    if (dto.directorName) {
      const exists = await this.directRepo.findOne({
        where: { directorName: dto.directorName },
      });
      if (exists && exists.directorId !== id) {
        throw new BadRequestException('Tên đạo diễn đã tồn tại!');
      }
      director.directorName = dto.directorName;
    }

    if (dto.story) director.story = dto.story;
    if (dto.avatarUrl) director.avatarUrl = dto.avatarUrl;

    return await this.directRepo.save(director);
  }

  async deleteDirector(id: number): Promise<void> {
    const director = await this.getDirectorById(id);
    if (!director) {
      throw new NotFoundException('Không tìm thấy đạo diễn!');
    }
    await this.directRepo.delete({ directorId: id });
  }

  async deleteAllDirectors(): Promise<void> {
    await this.directRepo.clear();
  }
}
