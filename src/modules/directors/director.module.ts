import { Module } from '@nestjs/common';
import { DirectorService } from './director.service';
import { DirectorController } from './director.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Director } from './director.entity';
import { AllCodes } from 'src/modules/allcodes/entities/allcodes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Director, AllCodes])],
  controllers: [DirectorController],
  providers: [DirectorService],
  exports: [DirectorService],
})
export class DirectorModule {}
