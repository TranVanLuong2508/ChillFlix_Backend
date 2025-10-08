import { Module } from '@nestjs/common';
import { DatabasesService } from './databases.service';
import { DatabasesController } from './databases.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllCode } from 'src/modules/all-codes/entities/all-code.entity';
import { AllCodesModule } from 'src/modules/all-codes/all-codes.module';

@Module({
  imports: [TypeOrmModule.forFeature([AllCode]), AllCodesModule],
  controllers: [DatabasesController],
  providers: [DatabasesService],
})
export class DatabasesModule {}
