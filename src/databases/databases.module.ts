import { Module } from '@nestjs/common';
import { DatabasesController } from './databases.controller';
import { DatabasesService } from './databases.service';
import { AllCodes } from 'src/modules/allcodes/entities/allcodes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([AllCodes])],
  controllers: [DatabasesController],
  providers: [DatabasesService],
})
export class DatabasesModule {}
