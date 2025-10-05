import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const isUserExist = await this.usersRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    if (isUserExist) {
      throw new BadRequestException(
        `Email: ${createUserDto.email} already exists in the system. Please use a different email.`,
      );
    } else {
      const hasedPassword = this.getHashPassword(createUserDto.password);

      const newuser = this.usersRepository.create({
        ...createUserDto,
        password: hasedPassword,
      });
      await this.usersRepository.save(newuser);
      return {
        userId: newuser.userId,
        createdAt: newuser.createdAt,
      };
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: number) {
    return await this.usersRepository.findOne({
      where: { userId: id },
    });
  }

  update(id: number) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findOneByUserName(userName: string) {
    return this.usersRepository.findOne({
      where: { email: userName },
      select: {
        email: true,
        password: true,
        userId: true,
        roleCode: true,
        fullName: true,
        genderCode: true,
        isVip: true,
        statusCode: true,
      },
    });
  }

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async findUserByRefreshToken(refresh_token: string) {
    return await this.usersRepository.findOne({
      where: { refreshToken: refresh_token },
    });
  }

  async updateUserToken(refresh_token: string, id: number) {
    return await this.usersRepository.update(
      { userId: id },
      { refreshToken: refresh_token },
    );
  }
}
