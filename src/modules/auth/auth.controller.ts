import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, SkipCheckPermission, User } from 'src/decorators/customize';
import { LocalAuthGuard } from 'src/modules/auth/local-auth.guard';
import type { Request, Response } from 'express';
import type { IUser } from 'src/modules/users/interface/user.interface';
import { RegisterUserDto } from 'src/modules/users/dto/register-user.dto';
import { RolesService } from '../roles/roles.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly roleService: RolesService,
  ) {}

  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('User Login')
  login(@Req() req, @Res({ passthrough: true }) response) {
    return this.authService.login(req.user, response);
  }

  @Public()
  @ResponseMessage('Get User by refresh token')
  @Get('/refreshToken')
  handleRefreshToken(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken: string = request.cookies['refresh_token'];
    return this.authService.processNewToken(refreshToken, response);
  }

  @Get('/account')
  @ResponseMessage('Get User information')
  async handleGetAccount(@User() user: IUser) {
    const temp = await this.roleService.findOne(1);
    user.permissions = temp.role?.permissons;
    return { user };
  }

  @Public()
  @Post('register')
  @ResponseMessage('Register a new user')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @ResponseMessage('Logout User')
  @Post('/logout')
  logout(@Res({ passthrough: true }) response: Response, @User() user: IUser) {
    return this.authService.handleLogout(response, user);
  }
}
