import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ResponseMessage, SkipCheckPermission, User } from 'src/decorators/customize';
import type { IUser } from '../users/interface/user.interface';
import { ReassignRoleDto } from './dto/reassign-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @SkipCheckPermission()
  @ResponseMessage('Create a Role')
  create(@Body() createRoleDto: CreateRoleDto, @User() user: IUser) {
    return this.rolesService.create(createRoleDto, user);
  }

  @Get()
  @ResponseMessage('Get all roles')
  @SkipCheckPermission()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ excludeExtraneousValues: true, enableImplicitConversion: true })
  @ResponseMessage('Get a role by id')
  @SkipCheckPermission()
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Get('get-by-id/:id')
  @SkipCheckPermission()
  GetById(@Param('id') id: string) {
    return this.rolesService.finOneById(+id);
  }

  @Patch(':id')
  @ResponseMessage('Update a role')
  @SkipCheckPermission()
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @User() user: IUser) {
    return this.rolesService.update(+id, updateRoleDto, user);
  }

  @Delete(':id')
  @SkipCheckPermission()
  @ResponseMessage('Delete a role')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.rolesService.remove(+id, user);
  }

  @Get(':id/check-delete')
  @SkipCheckPermission()
  @ResponseMessage('Check role before delete')
  checkBeforeDelete(@Param('id') id: string) {
    return this.rolesService.checkRoleBeforDelete(+id);
  }

  @Post(':id/reassign-and-delete')
  @ResponseMessage('Reassign users and delete role')
  @SkipCheckPermission()
  reassignAndDelete(@Param('id') id: string, @Body() dto: ReassignRoleDto, @User() user: IUser) {
    return this.rolesService.reassignAndDelete(+id, dto, user);
  }

  @Patch(':id/restore')
  @ResponseMessage('Restore a role')
  @SkipCheckPermission()
  restore(@Param('id') id: string, @User() user: IUser) {
    return this.rolesService.restore(+id, user);
  }
}
