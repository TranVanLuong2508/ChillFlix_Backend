import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { CloudinaryProvider } from './cloudinary/cloudinary.provider';
import { FileController } from './file.controller';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from './multer.config';

@Module({
  providers: [FileService, CloudinaryProvider],
  exports: [FileService, CloudinaryProvider],
  controllers: [FileController],
  imports: [
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
  ],
})
export class FileModule {}
