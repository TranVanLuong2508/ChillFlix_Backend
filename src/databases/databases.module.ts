import { Module } from '@nestjs/common';
import { DatabasesService } from './databases.service';
import { DatabasesController } from './databases.controller';
import { AllCodesService } from 'src/all-codes/all-codes.service';
import { AllCode } from 'src/all-codes/entities/all-code.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AllCode])],
  controllers: [DatabasesController],
  providers: [DatabasesService, AllCodesService],
  exports: [AllCodesService],
})
export class DatabasesModule {}
