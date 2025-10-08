import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AllCodes } from 'src/modules/allcodes/entities/allcodes.entity';
import { Repository } from 'typeorm';
import { INIT_ALLCODE } from 'src/databases/sample.allcode';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class DatabasesService implements OnModuleInit {
  private readonly logger = new Logger(DatabasesService.name);

  constructor(
    @InjectRepository(AllCodes)
    private allCodesRepository: Repository<AllCodes>,
    private configService: ConfigService,
  ) {}
  async onModuleInit() {
    const shouldInit = this.configService.get<string>('SHOULD_INIT');
    this.logger.log(`SHOULD_INIT = ${shouldInit}`);
    if (shouldInit) {
      await this.seed();
    } else {
      this.logger.log(`Không khởi tạo dữ liệu mẫu cho bảng allcode`);
    }
  }
  async seed() {
    const count = await this.allCodesRepository.count();
    this.logger.log(`Bảng allcode hiện có ${count} bản ghi`);
    if (count === 0) {
      await this.allCodesRepository.insert(INIT_ALLCODE);
      const total = await this.allCodesRepository.count();
      this.logger.log(
        `Đã tái tạo allcode thành công, tổng số bản ghi: ${total}`,
      );
    } else {
      this.logger.log(`allcode đã có dữ liệu, không cần tái tạo`);
    }
  }
  async clear() {
    await this.allCodesRepository.clear();
    return 'Đã xóa tất cả dữ liệu trong bảng allcode';
  }
  async reinit() {
    await this.allCodesRepository.clear();
    await this.allCodesRepository.insert(INIT_ALLCODE);
    return 'Đã tái tạo allcode thành công';
  }
  async check() {
    const count = await this.allCodesRepository.count();
    return `Bảng allcode có ${count} bản ghi`;
  }
}
