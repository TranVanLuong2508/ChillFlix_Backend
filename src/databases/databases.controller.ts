import { Controller, Get, Post, Delete } from '@nestjs/common';
import { DatabasesService } from './databases.service';

@Controller('databases')
export class DatabasesController {
  constructor(private readonly databasesService: DatabasesService) {}

  @Get('check')
  async checkInit() {
    return this.databasesService.check();
  }

  @Post('reinit')
  async reinit() {
    return this.databasesService.reinit();
  }

  @Delete('clear')
  async clear() {
    return this.databasesService.clear();
  }
}
