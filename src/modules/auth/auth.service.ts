import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { IUser } from 'src/modules/users/interface/user.interface';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';
import { Response } from 'express';
import { RegisterUserDto } from 'src/modules/users/dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUserName(email);
    if (user) {
      const isValidPassword = this.usersService.isValidPassword(pass, user.password);
      if (isValidPassword) {
        const { password, ...result } = user;
        return { EC: 0, EM: 'Login successful', result };
      }
    }
    return { EC: 1, EM: 'Invalid username or password' };
  }

  generateRefreshToken = (payload: any) => {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: ms(this.configService.get<string>('REFRESH_TOKEN_expiresIn') as ms.StringValue) / 1000,
    });
    return { EC: 0, EM: 'Create refresh token successfully', refreshToken };
  };

  async login(user: IUser, response: Response) {
    const { userId, email, roleId, fullName, genderCode, isVip, statusCode } = user;
    const payload = {
      iss: 'from server',
      sub: 'token login',
      userId,
      email,
      roleId,
      fullName,
      genderCode,
      isVip,
      statusCode,
    };

    //generate refresh token
    const refresh_token = this.generateRefreshToken(payload);
    await this.usersService.updateUserToken(refresh_token.refreshToken, userId);

    response.cookie('refresh_token', refresh_token.refreshToken, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('REFRESH_TOKEN_expiresIn')),
    });
    return {
      EC: 0,
      EM: 'Login successfully',
      access_token: this.jwtService.sign(payload),
      user: {
        userId,
        email,
        roleId,
        fullName,
        genderCode,
        isVip,
        statusCode,
      },
    };
  }

  async register(user: RegisterUserDto) {
    return await this.usersService.register(user);
  }

  async handleLogout(respones: Response, user: IUser) {
    await this.usersService.updateUserToken('', user.userId);
    respones.clearCookie('refresh_token');
    return { EC: 0, EM: 'Logout ok' };
  }

  createRefreshToken = (payload: any) => {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: ms(this.configService.get<string>('REFRESH_TOKEN_expiresIn')) / 1000,
    });
    return { EC: 0, EM: 'Create refresh token successfully', refresh_token };
  };

  async processNewToken(refreshToken: string, response: Response) {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });

      const user = await this.usersService.findUserByRefreshToken(refreshToken);
      if (user) {
        const { userId, email, roleId, fullName, genderCode, isVip, statusCode } = user;
        const payload = {
          iss: 'from server',
          sub: 'token login',
          userId,
          email,
          roleId,
          fullName,
          genderCode,
          isVip,
          statusCode,
        };
        const refresh_token = this.createRefreshToken(payload);

        await this.usersService.updateUserToken(refresh_token.refresh_token, userId);

        response.clearCookie('refresh_token');
        response.cookie('refresh_token', refresh_token.refresh_token, {
          httpOnly: true,
          maxAge: ms(this.configService.get<string>('REFRESH_TOKEN_expiresIn')),
        });
        return {
          EC: 0,
          EM: 'Get new token successfully',
          access_token: this.jwtService.sign(payload),
          user: {
            userId,
            email,
            roleId,
            fullName,
            genderCode,
            isVip,
            statusCode,
          },
        };
      } else {
        throw new BadRequestException(`Invalid refresh token. Please login.`);
      }
    } catch (error) {
      throw new UnauthorizedException('Authentication failed. Your refresh token is invalid or has expired.');
    }
  }
}
