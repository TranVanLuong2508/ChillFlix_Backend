import { Test, TestingModule } from '@nestjs/testing';
import { AllCodesController } from './all-codes.controller';
import { AllCodesService } from './all-codes.service';

describe('AllCodesController', () => {
  let controller: AllCodesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AllCodesController],
      providers: [AllCodesService],
    }).compile();

    controller = module.get<AllCodesController>(AllCodesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
