import { Injectable } from '@nestjs/common';
import { CreateAllCodeDto } from './dto/create-all-code.dto';
import { UpdateAllCodeDto } from './dto/update-all-code.dto';
import { InjectRepository } from '@nestjs/typeorm';
<<<<<<< HEAD
import { AllCode } from 'src/modules/all-codes/entities/all-code.entity';
=======
import { AllCode } from 'src/all-codes/entities/all-code.entity';
>>>>>>> dev-Quan
import { Repository } from 'typeorm';

@Injectable()
export class AllCodesService {
  constructor(
    @InjectRepository(AllCode)
<<<<<<< HEAD
    private allCodeRepository: Repository<AllCode>,
  ) {}
  create(createAllCodeDto: CreateAllCodeDto) {
    const newCode = this.allCodeRepository.create(createAllCodeDto);
    return this.allCodeRepository.save(newCode);
  }

  findAll() {
    return `This action returns all allCodes`;
=======
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
>>>>>>> dev-Quan
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
