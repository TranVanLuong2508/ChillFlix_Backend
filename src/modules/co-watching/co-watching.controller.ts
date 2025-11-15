import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CoWatchingService } from './co-watching.service';
import { CreateCoWatchingDto } from './dto/create-co-watching.dto';
import { UpdateCoWatchingDto } from './dto/update-co-watching.dto';

@Controller('co-watching')
export class CoWatchingController {
  constructor(private readonly coWatchingService: CoWatchingService) {}

  @Post()
  create(@Body() createCoWatchingDto: CreateCoWatchingDto) {
    return this.coWatchingService.create(createCoWatchingDto);
  }

  @Get()
  findAll(@Query('current') page: number, @Query('pageSize') limit: number, @Query() qs: string) {
    return this.coWatchingService.findAll(page, limit, qs);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coWatchingService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoWatchingDto: UpdateCoWatchingDto) {
    return this.coWatchingService.update(id, updateCoWatchingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coWatchingService.remove(id);
  }
}
