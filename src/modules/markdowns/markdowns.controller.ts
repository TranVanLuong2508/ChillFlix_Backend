import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MarkdownsService } from './markdowns.service';
import { CreateMarkdownDto } from './dto/create-markdown.dto';
import { UpdateMarkdownDto } from './dto/update-markdown.dto';

@Controller('markdowns')
export class MarkdownsController {
  constructor(private readonly markdownsService: MarkdownsService) {}

  @Post()
  create(@Body() createMarkdownDto: CreateMarkdownDto) {
    return this.markdownsService.create(createMarkdownDto);
  }

  @Get()
  findAll() {
    return this.markdownsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.markdownsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMarkdownDto: UpdateMarkdownDto) {
    return this.markdownsService.update(+id, updateMarkdownDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.markdownsService.remove(+id);
  }
}
