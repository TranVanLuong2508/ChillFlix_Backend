import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import type { IUser } from 'src/users/interface/user.interface';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

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
  getUsersWithPagination(@Query('current') currentPage: string, @Query('pageSize') limit: string, @Query() qs: string) {
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
  @ResponseMessage('Fetch user by id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch('update')
  @ResponseMessage('Update a user')
  update(@Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    return this.usersService.update(updateUserDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete a user')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(+id, user);
  }
}
