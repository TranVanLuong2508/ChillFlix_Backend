import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { DirectorService } from './director.service';
import { CreateDirectorDto } from './dto-director/create-director.dto';
import aqp from 'api-query-params';
import { PaginationDto } from './dto-director/pagination.dto';
import { UpdateDirectorDto } from './dto-director/update-director.dto';

@Controller('director')
export class DirectorController {
  constructor(private readonly director: DirectorService) {}

  // @Post('create-director')
  // createDirector(@Body() dto: CreateDirectorDto) {
  //   return this.director.createDirector(dto);
  // }
  // @Get('get-all-directors')
  // async getDirectors(@Query() query: PaginationDto) {
  //   const { filter, sort } = aqp(query);

  //   const page = query.page || 1;
  //   const take = query.limit || 5;
  //   const offset = (page - 1) * take;

  //   const result = await this.director.getDirectors({
  //     filter,
  //     sort,
  //     skip: offset,
  //     limit: take,
  //   });

  //   return {
  //     success: true,
  //     message: 'Lấy danh sách đạo diễn thành công',
  //     meta: {
  //       page,
  //       limit: take,
  //       total: result.total,
  //       totalPages: Math.ceil(result.total / take),
  //     },
  //     data: result.data,
  //   };
  // }
  // @Get('get-director-by-id')
  // async getDirectorById(@Query('id') id: number) {
  //   const director = await this.director.getDirectorById(id);
  //   return { data: director };
  // }
  // @Patch('edit-director')
  // async editDirector(@Query('id') id: number, @Body() dto: UpdateDirectorDto) {
  //   const director = await this.director.getDirectorById(id);
  //   return {
  //     success: await this.director.editDirector(id, dto),
  //     message: 'Đã cập nhật đạo diễn ' + director.directorName,
  //   };
  // }
  // @Delete('delete-director-by-id')
  // async deleteDirectorById(@Query('id') id: number) {
  //   const director = await this.director.getDirectorById(+id);
  //   return {
  //     success: await this.director.deleteDirector(id),
  //     message: 'Đã xóa đạo diễn ' + director.directorName,
  //   };
  // }
  // @Delete('delete-all-directors')
  // async deleteAllDirectors() {
  //   return {
  //     success: await this.director.deleteAllDirectors(),
  //     message: 'Đã xóa tất cả đạo diễn',
  //   };
  // }
}
