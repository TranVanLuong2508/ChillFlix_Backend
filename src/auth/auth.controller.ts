import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import type { IUser } from 'src/users/interface/user.interface';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { RegisterUserDto } from 'src/users/dto/register-user.dto';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    const refreshToken = request.cookies['refresh_token'];
    return this.authService.processNewToken(refreshToken, response);
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
