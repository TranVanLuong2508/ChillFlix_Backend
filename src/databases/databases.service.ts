import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AllCode } from 'src/all-codes/entities/all-code.entity';
import { Repository } from 'typeorm';
import { INIT_ALLCODE } from 'src/databases/sample.allcode';

@Injectable()
export class DatabasesService implements OnModuleInit {
  private readonly logger = new Logger(DatabasesService.name);
  constructor(
    @InjectRepository(AllCode)
    private allCodeRepository: Repository<AllCode>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const shouldInit = this.configService.get<boolean>('SHOULD_INIT');
    if (Boolean(shouldInit)) {
      console.log('should');
      const countCode = await this.allCodeRepository.count();

      if (countCode === 0) {
        await this.allCodeRepository.insert(INIT_ALLCODE);
      }

      if (countCode > 0) {
        this.logger.warn('>>> ALREADY INIT SAMPLE DATA...');
      }
    }
  }
}
