import { Injectable } from '@nestjs/common';
import { CreateAllCodeDto } from './dto/create-all-code.dto';
import { UpdateAllCodeDto } from './dto/update-all-code.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AllCode } from 'src/all-codes/entities/all-code.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AllCodesService {
  constructor(
    @InjectRepository(AllCode)
    private allCodesRepository: Repository<AllCode>,
  ) {}
  create(createAllCodeDto: CreateAllCodeDto) {
    const newCode = this.allCodesRepository.create({
      ...createAllCodeDto,
    });
    return this.allCodesRepository.save(newCode);
  }

  findAll() {
    return this.allCodesRepository.count();
  }

  findOne(id: number) {
    return `This action returns a #${id} allCode`;
  }

  update(id: number, updateAllCodeDto: UpdateAllCodeDto) {
    return `This action updates a #${id} allCode`;
  }

  remove(id: number) {
    return `This action removes a #${id} allCode`;
  }
}
