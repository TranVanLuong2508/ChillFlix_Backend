import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllCodesService } from './allcodes.service';
import { AllCodesController } from './allcodes.controller';
import { AllCodes } from './entities/allcodes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AllCodes])],
  controllers: [AllCodesController],
  providers: [AllCodesService],
  exports: [AllCodesService],
})
export class AllCodesModule {}
