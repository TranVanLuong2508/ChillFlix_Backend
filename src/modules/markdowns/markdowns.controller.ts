import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MarkdownsService } from './markdowns.service';
import { CreateMarkdownDto } from './dto/create-markdown.dto';
import { UpdateMarkdownDto } from './dto/update-markdown.dto';
import { ResponseMessage, User } from 'src/decorators/customize';
import type { IUser } from '../users/interface/user.interface';

@Controller('markdowns')
export class MarkdownsController {
  constructor(private readonly markdownsService: MarkdownsService) {}

  @Post()
  @ResponseMessage('Create a markdown')
  create(@Body() createMarkdownDto: CreateMarkdownDto, @User() user: IUser) {
    return this.markdownsService.create(createMarkdownDto, user);
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
