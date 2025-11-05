import { Injectable } from '@nestjs/common';
import { CreateMarkdownDto } from './dto/create-markdown.dto';
import { UpdateMarkdownDto } from './dto/update-markdown.dto';

@Injectable()
export class MarkdownsService {
  create(createMarkdownDto: CreateMarkdownDto) {
    return 'This action adds a new markdown';
  }

  findAll() {
    return `This action returns all markdowns`;
  }

  findOne(id: number) {
    return `This action returns a #${id} markdown`;
  }

  update(id: number, updateMarkdownDto: UpdateMarkdownDto) {
    return `This action updates a #${id} markdown`;
  }

  remove(id: number) {
    return `This action removes a #${id} markdown`;
  }
}
