import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { DirectorService } from './director.service';
import { CreateDirectorDto } from './dto-director/create-director.dto';
import aqp from 'api-query-params';
import { PaginationDto } from './dto-director/pagination.dto';
import { UpdateDirectorDto } from './dto-director/update-director.dto';

@Controller('director')
export class DirectorController {
  constructor(private readonly director: DirectorService) {}

  @Post('create-director')
  createDirector(@Body() dto: CreateDirectorDto) {
    return this.director.createDirector(dto);
  }
  @Get('get-all-directors')
  async getDirectors(@Query() query: PaginationDto) {
    const { filter, sort } = aqp(query);

    const page = query.page || 1;
    const take = query.limit || 5;
    const offset = (page - 1) * take;

    const result = await this.director.getDirectors({
      filter,
      sort,
      skip: offset,
      limit: take,
    });
    const [data, total] = result.data;

    return {
      success: true,
      message: 'Take all directors successfully',
      meta: {
        page,
        limit: take,
        total: total,
        totalPages: Math.ceil(total / take),
      },
      result: data,
    };
  }
  @Get('get-director-by-id')
  async getDirectorById(@Query('id') id: number) {
    const director = await this.director.getDirectorById(id);
    return { director };
  }
  @Patch('edit-director')
  async editDirector(@Query('id') id: number, @Body() dto: UpdateDirectorDto) {
    const director = await this.director.getDirectorById(id);
    return {
      success: await this.director.editDirector(id, dto),
      message: 'Update director successfully',
    };
  }
  @Delete('delete-director-by-id')
  async deleteDirectorById(@Query('id') id: number) {
    await this.director.getDirectorById(id);
    return {
      success: await this.director.deleteDirector(id),
      message: 'Delete director successfully',
    };
  }
  @Delete('delete-all-directors')
  async deleteAllDirectors() {
    return {
      success: await this.director.deleteAllDirectors(),
      message: 'Delete all directors successfully',
    };
  }
}
