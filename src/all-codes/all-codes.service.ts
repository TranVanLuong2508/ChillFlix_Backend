import { Injectable } from '@nestjs/common';
import { CreateAllCodeDto } from './dto/create-all-code.dto';
import { UpdateAllCodeDto } from './dto/update-all-code.dto';

@Injectable()
export class AllCodesService {
  create(createAllCodeDto: CreateAllCodeDto) {
    return 'This action adds a new allCode';
  }

  findAll() {
    return `This action returns all allCodes`;
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
