import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { AllCodesService } from './all-codes.service';
import { CreateAllCodeDto } from './dto/create-all-code.dto';
import { UpdateAllCodeDto } from './dto/update-all-code.dto';

@Controller('all-codes')
export class AllCodesController {
  constructor(private readonly allCodesService: AllCodesService) {}

  @Post()
  create(@Body() createAllCodeDto: CreateAllCodeDto) {
    return this.allCodesService.create(createAllCodeDto);
  }

  @Get()
  findAll() {
    return this.allCodesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.allCodesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAllCodeDto: UpdateAllCodeDto) {
    return this.allCodesService.update(+id, updateAllCodeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.allCodesService.remove(+id);
  }
}
