import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { INIT_ALLCODE } from 'src/databases/sample.allcode';
import { AllCode } from 'src/modules/all-codes/entities/all-code.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DatabasesService implements OnModuleInit {
  private readonly logger = new Logger(DatabasesService.name);
  constructor(
    @InjectRepository(AllCode)
    private allCodesRepository: Repository<AllCode>,
    private configService: ConfigService,
  ) {}
  async onModuleInit() {
    const shouldInit = this.configService.get<string>('SHOULD_INIT');
    if (shouldInit && Boolean(shouldInit)) {
      const countCode = await this.allCodesRepository.count();
      if (countCode === 0) {
        await this.allCodesRepository.insert(INIT_ALLCODE);
      }
      if (countCode > 0) {
        this.logger.warn('>>> ALREADY INIT SAMPLE DATA...');
      }
    }
  }
}
