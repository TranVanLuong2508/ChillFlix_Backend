import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AllCode } from 'src/all-codes/entities/all-code.entity';
import { Repository } from 'typeorm';
import { INIT_ALLCODE } from 'src/databases/sampleData/sample.allcode';
import { User } from 'src/users/entities/user.entity';
import {
  ADMIN_ROLE,
  GENDER_Female,
  GENDER_Male,
  GENDER_Other,
  USER_ROLE,
} from 'src/constants/allcode.constant';

@Injectable()
export class DatabasesService implements OnModuleInit {
  private readonly logger = new Logger(DatabasesService.name);
  constructor(
    @InjectRepository(AllCode)
    private allCodeRepository: Repository<AllCode>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const shouldInit = this.configService.get<boolean>('SHOULD_INIT');
    if (Boolean(shouldInit)) {
      console.log('should init if data row count = 0');
      const countCode = await this.allCodeRepository.count();
      const countUser = await this.userRepository.count();

      if (countCode === 0) {
        await this.allCodeRepository.insert(INIT_ALLCODE);
      }

      if (countUser === 0) {
        const initPassword = this.configService.get<string>('INIT_PASSWORD');
        await this.userRepository.insert([
          {
            email: 'admin@gmail.com',
            fullName: 'admin',
            age: 30,
            password: initPassword,
            phoneNumber: '0768894134',
            genderCode: GENDER_Male,
            roleCode: ADMIN_ROLE,
            isVip: true,
            statusCode: 'US_ACTIVE',
            isDeleted: false,
          },
          {
            email: 'user@gmail.com',
            fullName: 'Normal user',
            age: 28,
            password: initPassword,
            phoneNumber: '0768894134',
            genderCode: GENDER_Female,
            roleCode: USER_ROLE,
            isVip: false,
            statusCode: 'US_ACTIVE',
            isDeleted: false,
          },
          {
            email: 'user2@gmail.com',
            fullName: 'Trần Mai',
            age: 28,
            password: initPassword,
            phoneNumber: '0768894134',
            genderCode: GENDER_Female,
            roleCode: USER_ROLE,
            isVip: false,
            statusCode: 'US_ACTIVE',
            isDeleted: false,
          },
          {
            email: 'user3@gmail.com',
            fullName: 'Phạm Quốc D',
            age: 26,
            password: initPassword,
            phoneNumber: '0717433007',
            genderCode: GENDER_Other,
            roleCode: USER_ROLE,
            isVip: false,
            statusCode: 'US_ACTIVE',
            isDeleted: false,
          },
        ]);
      }
      if (countCode > 0 && countUser > 0) {
        this.logger.warn('>>> ALREADY INIT SAMPLE DATA...');
      }
    }
  }
}
