import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public, ResponseMessage, SkipCheckPermission, User } from 'src/decorators/customize';
import type { IUser } from 'src/modules/users/interface/user.interface';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Public()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('get-user-with-pagination')
  @ResponseMessage('Fetch user with pagination')
  getUsersWithPagination(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.usersService.getUsersWithPagination(+currentPage, +limit, qs);
  }

  @Public()
  @Get()
  @ResponseMessage('get All Users')
  findAll() {
    return this.usersService.findAll();
  }

  @Public()
  @Get(':id')
  @SkipCheckPermission()
  @ResponseMessage('Fetch user by id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch('update')
  @ResponseMessage('Update a user')
  update(@Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    return this.usersService.update(updateUserDto, user);
  }
  @Patch('update-profile')
  @SkipCheckPermission()
  @ResponseMessage('Update profle a user')
  updateProfile(@Body() updateProfileDto: UpdateProfileDto, @User() user: IUser) {
    console.log('call update');
    return this.usersService.updateProfile(updateProfileDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete a user')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(+id, user);
  }
}
