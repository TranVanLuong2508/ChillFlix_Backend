import { Module } from '@nestjs/common';
import { DirectorService } from './director.service';
import { DirectorController } from './director.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Director } from './director.entity';
import { AllCode } from 'src/modules/all-codes/entities/all-code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Director, AllCode])],
  controllers: [DirectorController],
  providers: [DirectorService],
  exports: [DirectorService],
})
export class DirectorModule {}
