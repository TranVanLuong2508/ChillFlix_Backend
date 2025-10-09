import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import type { IUser } from 'src/modules/users/interface/user.interface';
import { ResponseMessage, User } from 'src/decorators/customize';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ResponseMessage('Create a new permission')
  create(@Body() createPermissionDto: CreatePermissionDto, @User() user: IUser) {
    return this.permissionsService.create(createPermissionDto, user);
  }

  @Get()
  @ResponseMessage('Fetch all permission')
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get('get-permission-with-pagination')
  @ResponseMessage('Fetch permissions with pagination')
  getPermissionsWithPagination(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.permissionsService.getPermissionsWithPagination(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Fetch a permission by id')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(+id);
  }

  @Patch(':id')
  @ResponseMessage('Update a permission')
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto, @User() user: IUser) {
    return this.permissionsService.update(+id, updatePermissionDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete a permission')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.permissionsService.remove(+id, user);
  }
}
