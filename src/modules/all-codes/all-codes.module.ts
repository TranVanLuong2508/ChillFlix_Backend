import { Module } from '@nestjs/common';
import { AllCodesService } from './all-codes.service';
import { AllCodesController } from './all-codes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllCode } from './entities/all-code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AllCode])],
  controllers: [AllCodesController],
  providers: [AllCodesService],
  exports: [AllCodesService],
})
export class AllCodesModule {}
