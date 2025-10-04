import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUserName(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      console.log('user', user);

      return result;
    }
    return null;
  }

  login(user: any) {
    const payload = {
      username: user.email,
      sub: user.id,
    };
    return {
      payload: payload,
    };
  }
}
