import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AllCodes } from './entities/allcodes.entity';
import { CreateAllCodeDto } from './dto-allcodes/create-allcodes.dto';
import { UpdateAllCodeDto } from './dto-allcodes/update-allcodes.dto';

@Injectable()
export class AllCodesService {
  constructor(
    @InjectRepository(AllCodes)
    private allCodeRepo: Repository<AllCodes>,
  ) {}

  async create(dto: CreateAllCodeDto) {
    const allCode = this.allCodeRepo.create(dto);
    return await this.allCodeRepo.save(allCode);
  }

  async findAll(type?: string) {
    if (type) {
      return await this.allCodeRepo.find({ where: { type } });
    }
    return await this.allCodeRepo.find();
  }

  async findOne(id: number, dto: UpdateAllCodeDto) {
    const allCode = await this.allCodeRepo.findOne({ where: { id } });
    if (!allCode) throw new NotFoundException(`AllCode #${id} not found`);
    const exists = await this.allCodeRepo.findOne({
      where: { keyMap: dto.keyMap, type: dto.type },
    });
    if (exists) {
      throw new BadRequestException(`keyMap đã tồn tại`);
    }
    return allCode;
  }

  async update(id: number, dto: UpdateAllCodeDto) {
    const allCode = await this.findOne(id, dto);
    Object.assign(allCode, dto);
    return await this.allCodeRepo.save(allCode);
  }

  async remove(id: number, dto: UpdateAllCodeDto) {
    const allCode = await this.findOne(id, dto);
    return await this.allCodeRepo.remove(allCode);
  }
}
