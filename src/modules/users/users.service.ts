import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { RegisterUserDto } from 'src/modules/users/dto/register-user.dto';
import { IUser } from 'src/modules/users/interface/user.interface';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import aqp from 'api-query-params';

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

  async findAll() {
    return await this.usersRepository.find({});
  }

  async findOne(id: number) {
    return await this.usersRepository.findOne({
      where: { userId: id },
      relations: ['gender', 'role'],
      select: {
        gender: {
          keyMap: true,
          valueEn: true,
          valueVi: true,
          description: true,
        },
        role: {
          keyMap: true,
          valueEn: true,
          valueVi: true,
          description: true,
        },
      },
    });
  }

  async update(updateUser: UpdateUserDto, user: IUser) {
    const updated = await this.usersRepository.update(
      {
        userId: updateUser.userId,
      },
      {
        ...updateUser,
        updatedBy: user.userId,
        updatedAt: new Date(),
      },
    );

    return updated;
  }

  async remove(id: number, user: IUser) {
    const foundUser = await this.usersRepository.findOne({
      where: { userId: id },
    });

    if (!foundUser) {
      throw new BadRequestException('not found user');
    }

    if (foundUser && foundUser.email === 'admin@gmail.com') {
      throw new BadRequestException('CAN NOT DELETE ADMIN ACCOUNT : admin@gmail.com');
    }

    const deleted = await this.usersRepository.update(
      { userId: id },
      {
        isDeleted: true,
        deletedBy: user.userId,
        deletedAt: new Date(),
      },
    );

    return {
      deletedResult: deleted,
      EC: 0,
    };
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
    return await this.usersRepository.update({ userId: id }, { refreshToken: refresh_token });
  }

  async register(user: RegisterUserDto) {
    const { email, password, genderCode, phoneNumber, age, fullName } = user;
    const isUserExist = await this.usersRepository.findOne({
      where: { email: email },
    });

    if (isUserExist) {
      throw new BadRequestException(`Email: ${email} already exists in the system. Please use a different email.`);
    }
    const hashedPassword = this.getHashPassword(password);
    const newUser = this.usersRepository.create({
      email,
      fullName,
      password: hashedPassword,
      genderCode,
      phoneNumber,
      age,
    });

    await this.usersRepository.save(newUser);

    return newUser;
  }

  async getUsersWithPagination(currentPage: number, limit: number, qs: string) {
    const { filter, sort } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.usersRepository.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.usersRepository.find({
      where: filter,
      skip: offset,
      take: defaultLimit,
      order: sort,
    });

    return {
      metaData: {
        current: currentPage,
        pageSize: limit,
        totalPages: totalPages,
        totalItems: totalItems,
      },
      users: result,
    };
  }
}
