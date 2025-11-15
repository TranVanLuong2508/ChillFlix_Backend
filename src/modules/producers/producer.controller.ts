import { Controller, Delete, Get, Param, Patch, Post, Query, ParseIntPipe, Body } from "@nestjs/common"
import { ProducerService } from "./producer.service"
import { CreateProducerDto } from "./dto/create-producer.dto"
import { UpdateProducerDto } from "./dto/update-producer.dto"
import { PaginationDto } from "./dto/pagination.dto"
import { Public, ResponseMessage, User, SkipCheckPermission } from "src/decorators/customize"
import type { IUser } from "../users/interface/user.interface"

@Controller("producer")
export class ProducerController {
  constructor(private readonly producerService: ProducerService) { }

  @Post("create-producer")
  @SkipCheckPermission()
  @ResponseMessage("Create a new producer")
  async createProducer(@Body() dto: CreateProducerDto, @User() user: IUser) {
    return await this.producerService.createProducer(dto, user)
  }

  @Get('get-all-producers')
  @ResponseMessage('Get all producers with pagination, filtering, and sorting')
  async getAllProducers(@Query() query: PaginationDto) {
    return await this.producerService.getAllProducers(query);
  }

  @Public()
  @Get('get-producer-by-id/:producerId')
  @ResponseMessage('Get producer by ID')
  async getProducerById(@Param('producerId', ParseIntPipe) producerId: number) {
    return await this.producerService.getProducerById(producerId);
  }

  @Patch("edit-producer/:producerId")
  @ResponseMessage("Edit producer by ID")
  async updateProducer(
    @Param('producerId', ParseIntPipe) producerId: number,
    dto: UpdateProducerDto,
    @User() user: IUser,
  ) {
    return await this.producerService.updateProducer(producerId, dto, user)
  }

  @Delete("delete-producer-by-id/:producerId")
  @ResponseMessage("Delete producer by ID")
  async deleteProducerById(@Param('producerId', ParseIntPipe) producerId: number, @User() user: IUser) {
    return await this.producerService.deleteProducerById(producerId, user)
  }

  @Public()
  @Get("get-films-by-producer/:producerId")
  @ResponseMessage("Get all films by producer ID")
  async getFilmsByProducerId(@Param('producerId', ParseIntPipe) producerId: number, @Query() query: PaginationDto) {
    return await this.producerService.getFilmsByProducerId(producerId, query)
  }
}
