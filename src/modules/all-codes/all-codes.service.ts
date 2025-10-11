import { Injectable } from '@nestjs/common';
import { CreateAllCodeDto } from './dto/create-all-code.dto';
import { UpdateAllCodeDto } from './dto/update-all-code.dto';
import { InjectRepository } from '@nestjs/typeorm';

import { AllCode } from 'src/modules/all-codes/entities/all-code.entity';

import { Repository } from 'typeorm';

@Injectable()
export class AllCodesService {
  constructor(
    @InjectRepository(AllCode)
    private allCodeRepository: Repository<AllCode>,
  ) {}
  create(createAllCodeDto: CreateAllCodeDto) {
    const newCode = this.allCodeRepository.create(createAllCodeDto);
    return this.allCodeRepository.save(newCode);
  }

  findAll() {
    return { EC: 0, EM: `This action returns all allCodes` };
  }

  findOne(id: number) {
    return { EC: 0, EM: `This action returns a #${id} allCode` };
  }

  update(id: number, updateAllCodeDto: UpdateAllCodeDto) {
    return { EC: 0, EM: `This action updates a #${id} allCode` };
  }

  remove(id: number) {
    return { EC: 0, EM: `This action removes a #${id} allCode` };
  }
}
