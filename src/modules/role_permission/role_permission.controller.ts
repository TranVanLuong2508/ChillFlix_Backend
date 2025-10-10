import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RolePermissionService } from './role_permission.service';
import { CreateRolePermissionDto } from './dto/create-role_permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role_permission.dto';
import { ResponseMessage, User } from 'src/decorators/customize';
import type { IUser } from '../users/interface/user.interface';
import { DeleteRolePermissionDto } from './dto/delete-role_permisson.dto';

@Controller('role-permission')
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  @Post()
  create(@Body() createRolePermissionDto: CreateRolePermissionDto, @User() user: IUser) {
    return this.rolePermissionService.create(createRolePermissionDto, user);
  }

  @Delete('/delete')
  @ResponseMessage('Delete a role permisson')
  remove(@Body() deleteRolePermissionDto: DeleteRolePermissionDto, @User() user: IUser) {
    return this.rolePermissionService.remove(deleteRolePermissionDto, user);
  }
}
