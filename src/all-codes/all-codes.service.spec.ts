import { Test, TestingModule } from '@nestjs/testing';
import { AllCodesService } from './all-codes.service';

describe('AllCodesService', () => {
  let service: AllCodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AllCodesService],
    }).compile();

    service = module.get<AllCodesService>(AllCodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
