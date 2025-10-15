import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { ActorService } from './actor.service';
import { CreateActorDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';
import { PaginationActorDto } from './dto/pagination-actor.dto';
import { ResponseMessage } from 'src/decorators/customize';

@Controller('actor')
export class ActorController {
  constructor(private readonly actorService: ActorService) {}

  @Post('create-actor')
  @ResponseMessage('Create a new actor')
  async createActor(@Body() dto: CreateActorDto) {
    return await this.actorService.createActor(dto);
  }

  @Get('all-actors')
  @ResponseMessage('Get all actors with pagination, filtering, and sorting')
  async getAllActors(@Query() query: PaginationActorDto) {
    return await this.actorService.getAllActors(query);
  }

  @Get('get-actor-by-id/:actorId')
  @ResponseMessage('Get actor by ID')
  async getActorById(@Param('actorId') actorId: number) {
    return await this.actorService.getActorById(actorId);
  }

  @Patch('update-actor/:actorId')
  @ResponseMessage('Update actor by ID')
  async updateActor(@Param('actorId') actorId: number, @Body() update: UpdateActorDto) {
    return await this.actorService.updateActor(actorId, update);
  }

  @Delete('delete-actor-by-id/:actorId')
  @ResponseMessage('Delete actor by ID')
  async deleteActorById(@Param('actorId') actorId: number) {
    return await this.actorService.deleteActorById(actorId);
  }
}
