import { Module } from '@nestjs/common';
import { MarkdownsService } from './markdowns.service';
import { MarkdownsController } from './markdowns.controller';

@Module({
  controllers: [MarkdownsController],
  providers: [MarkdownsService],
})
export class MarkdownsModule {}
