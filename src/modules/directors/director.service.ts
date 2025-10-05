import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDirectorDto } from '../dto-director/create-director.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Director } from '../../entities/director.entity';
import { AllCodes } from 'src/entities/allcodes.entity';

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
      throw new BadRequestException(
        `Giá trị gender = ${dto.gender} không hợp lệ!`,
      );
    }

    const director = this.directRepo.create({
      directorName: dto.directorName,
      genderId: gender.id.toString(),
      story: dto.story,
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

  async getDirectors(): Promise<Director[]> {
    return await this.directRepo.find({ relations: ['gender'] });
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

  async editDirector(id: number, dto: CreateDirectorDto): Promise<Director> {
    const director = await this.getDirectorById(id);

    if (dto.gender) {
      const gender = await this.allcodeRepo.findOne({
        where: { keyMap: dto.gender, type: 'GENDER' },
      });
      if (!gender) {
        throw new BadRequestException(
          `Giá trị gender = ${dto.gender} không hợp lệ!`,
        );
      }
      director.genderId = gender.id.toString();
      director.gender = gender;
    }

    if (dto.directorName) director.directorName = dto.directorName;
    if (dto.story) director.story = dto.story;

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
