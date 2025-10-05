import { Module } from '@nestjs/common';
import { DirectorService } from './director.service';
import { DirectorController } from './director.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Director } from 'src/entities/director.entity';
import { AllCodes } from 'src/entities/allcodes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Director, AllCodes])],
  controllers: [DirectorController],
  providers: [DirectorService],
  exports: [DirectorService],
})
export class DirectorModule {}
