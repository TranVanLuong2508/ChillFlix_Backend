import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AllCodesService } from './allcodes.service';
import { CreateAllCodeDto } from 'src/modules/allcodes/dto-allcodes/create-allcodes.dto';
import { UpdateAllCodeDto } from 'src/modules/allcodes/dto-allcodes/update-allcodes.dto';

@Controller('all-codes')
export class AllCodesController {
  constructor(private readonly allCodesService: AllCodesService) {}

  @Post('add')
  create(@Body() dto: CreateAllCodeDto) {
    return this.allCodesService.create(dto);
  }

  @Get('all')
  findAll(@Query('type') type: string) {
    return this.allCodesService.findAll(type);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @Body() dto: UpdateAllCodeDto) {
    return this.allCodesService.findOne(id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateAllCodeDto) {
    return this.allCodesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @Body() dto: UpdateAllCodeDto) {
    return this.allCodesService.remove(id, dto);
  }
}
