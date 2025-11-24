import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { ActorService } from './actor.service';
import { CreateActorDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';
import { PaginationActorDto } from './dto/pagination-actor.dto';
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import type { IUser } from '../users/interface/user.interface';

@Controller('actor')
export class ActorController {
  constructor(private readonly actorService: ActorService) {}

  @Post('create-actor')
  @ResponseMessage('Create a new actor')
  async createActor(@Body() dto: CreateActorDto, @User() user: IUser) {
    return await this.actorService.createActor(dto, user);
  }

  @Post('create-list-actor')
  @ResponseMessage('Create a new actor')
  async createListActor(@Body() dto: CreateActorDto[], @User() user: IUser) {
    return await this.actorService.createListActor(dto, user);
  }

  @Get('all-actors')
  @ResponseMessage('Get all actors with pagination, filtering, and sorting')
  async getAllActors(@Query() query: PaginationActorDto) {
    return await this.actorService.getAllActors(query);
  }
  
  @Public()
  @Get('get-actor-by-id/:actorId')
  @ResponseMessage('Get actor by ID')
  async getActorById(@Param('actorId') actorId: number) {
    return await this.actorService.getActorById(actorId);
  }
  @Public()
  @Get('get-actor-by-slug/:actorSlug')
  @ResponseMessage('Get actor by Slug')
  async getActorBySlug(@Param('actorSlug') actorSlug: string) {
    return await this.actorService.getActorBySlug(actorSlug);
  }

  @Patch('update-actor/:actorId')
  @ResponseMessage('Update actor by ID')
  async updateActor(@Param('actorId') actorId: number, @Body() update: UpdateActorDto, @User() user: IUser) {
    return await this.actorService.updateActor(actorId, update, user);
  }

  @Delete('delete-actor-by-id/:actorId')
  @ResponseMessage('Delete actor by ID')
  async deleteActorById(@Param('actorId') actorId: number, @User() user: IUser) {
    return await this.actorService.deleteActorById(actorId, user);
  }
}
