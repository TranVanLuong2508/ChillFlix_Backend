import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { Public, User } from 'src/decorators/customize';
import type { IUser } from '../users/interface/user.interface';

@Controller('parts')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ excludeExtraneousValues: true, enableImplicitConversion: true })
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post()
  create(@Body() createPartDto: CreatePartDto, @User() user: IUser) {
    return this.partsService.create(createPartDto, user);
  }

  @Public()
  @Post('film')
  findAll(@Body() { filmId }: { filmId: string }) {
    return this.partsService.findAll(filmId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePartDto: UpdatePartDto, @User() user: IUser) {
    return this.partsService.update(id, updatePartDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.partsService.remove(id, user);
  }
}
