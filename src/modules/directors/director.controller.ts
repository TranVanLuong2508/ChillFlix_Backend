import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { DirectorService } from './director.service';
import { CreateDirectorDto } from '../dto-director/create-director.dto';
import { PaginationDto } from '../dto-director/pagination.dto';
@Controller('director')
export class DirectorController {
  constructor(private readonly director: DirectorService) {}

  @Post('create-director')
  createDirector(@Body() dto: CreateDirectorDto) {
    return this.director.createDirector(dto);
  }
  @Get('get-all-directors')
  async getDirectors(@Query() pagination: PaginationDto) {
    const directors = await this.director.getDirectors(pagination);
    return { data: [...directors] };
  }
  @Get('get-director-by-id')
  async getDirectorById(@Query('id') id: number) {
    const director = await this.director.getDirectorById(id);
    return { data: director };
  }
  @Patch('edit-director')
  async editDirector(@Query('id') id: number, @Body() dto: CreateDirectorDto) {
    const director = await this.director.getDirectorById(id);
    return {
      success: await this.director.editDirector(id, dto),
      message: 'Đã cập nhật đạo diễn ' + director.directorName,
    };
  }
  @Delete('delete-director-by-id')
  async deleteDirectorById(@Query('id') id: number) {
    const director = await this.director.getDirectorById(+id);
    return {
      success: await this.director.deleteDirector(id),
      message: 'Đã xóa đạo diễn ' + director.directorName,
    };
  }
  @Delete('delete-all-directors')
  async deleteAllDirectors() {
    return {
      success: await this.director.deleteAllDirectors(),
      message: 'Đã xóa tất cả đạo diễn',
    };
  }
}
