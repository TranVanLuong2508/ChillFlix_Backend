import { Module } from '@nestjs/common';
import { AllCodesService } from './all-codes.service';
import { AllCodesController } from './all-codes.controller';

@Module({
  controllers: [AllCodesController],
  providers: [AllCodesService],
})
export class AllCodesModule {}
