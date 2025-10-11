import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { IUser } from '../users/interface/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}
  async create(createRoleDto: CreateRoleDto, user: IUser) {
    try {
      const { roleName, description, isActive } = createRoleDto;

      const isExist = await this.roleRepository.exists({
        where: { roleName: roleName },
      });

      if (isExist) {
        return {
          EC: 0,
          EM: `Role ${roleName} is already exist`,
        };
      } else {
        const newRole = this.roleRepository.create({
          roleName,
          description,
          isActive,
          createdBy: user.userId,
        });

        await this.roleRepository.save(newRole);

        return {
          EC: 1,
          EM: 'Create new role success',
          roleId: newRole?.roleId,
          createdAt: newRole?.createdAt,
        };
      }
    } catch (error: any) {
      console.error('Error in create role:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: `Error from create role service`,
      });
    }
  }

  async findAll() {
    try {
      const result = await this.roleRepository.find({});
      if (result) {
        return {
          EC: 1,
          EM: 'Get all roles success',
          roles: result,
        };
      }
    } catch (error) {
      console.error('Error in findAll Roles:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from findAll Roles service',
      });
    }
  }

  async findOne(id: number) {
    try {
      const foundRole = await this.roleRepository.findOne({
        where: { roleId: id },
        select: {
          roleId: true,
          roleName: true,
          description: true,
        },
        relations: ['rolePermission', 'rolePermission.permission'],
      });
      if (!foundRole) {
        return {
          EC: 0,
          EM: 'Role not found',
        };
      }

      return {
        EC: 1,
        EM: 'Find a role success',
        ...foundRole,
      };
    } catch (error: any) {
      console.error('Error in findOne role:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from findOne role service',
      });
    }
  }

  async update(id: number, updateRoleDto: UpdateRoleDto, user: IUser) {
    try {
      const updateResult = await this.roleRepository.update(
        {
          roleId: id,
        },
        {
          ...updateRoleDto,
          updatedAt: new Date(),
          updatedBy: user.userId,
        },
      );

      if (updateResult.affected === 0) {
        return {
          EC: 0,
          EM: 'Role not found',
        };
      }

      return {
        EC: 1,
        EM: 'Update Role success',
        ...updateResult,
      };
    } catch (error: any) {
      console.error('Error in update Role:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from update Role service',
      });
    }
  }

  async remove(id: number, user: IUser) {
    try {
      const result = await this.roleRepository.update(
        {
          roleId: id,
        },
        {
          deletedAt: new Date(),
          isDeleted: true,
          deletedBy: user.userId,
        },
      );

      if (result.affected === 0) {
        return {
          EC: 0,
          EM: 'Role not found',
        };
      } else {
        return {
          EC: 1,
          EM: `Role is deleted`,
          ...result,
        };
      }
    } catch (error: any) {
      console.error('Error in delete Role:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from delete Role service',
      });
    }
  }
}
