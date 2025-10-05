import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { IUser } from 'src/users/interface/user.interface';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';
import { Response } from 'express';

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
      const isValidPassword = this.usersService.isValidPassword(
        pass,
        user.password,
      );
      if (isValidPassword) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  generateRefreshToken = (payload: any) => {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(
          this.configService.get<string>(
            'REFRESH_TOKEN_expiresIn',
          ) as ms.StringValue,
        ) / 1000,
    });
    return refreshToken;
  };

  async login(user: IUser, response: Response) {
    const { userId, email, roleCode, fullName, genderCode, isVip, statusCode } =
      user;
    const payload = {
      iss: 'from server',
      sub: 'token login',
      userId,
      email,
      roleCode,
      fullName,
      genderCode,
      isVip,
      statusCode,
    };

    //generate refresh token
    const refresh_token = this.generateRefreshToken(payload);
    await this.usersService.updateUserToken(refresh_token, userId);

    response.cookie('refresh_token', refresh_token, {
      maxAge: ms(
        this.configService.get<string>(
          'REFRESH_TOKEN_expiresIn',
        ) as ms.StringValue,
      ),
      httpOnly: true,
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        userId,
        email,
        roleCode,
        fullName,
        genderCode,
        isVip,
        statusCode,
      },
    };
  }
}
