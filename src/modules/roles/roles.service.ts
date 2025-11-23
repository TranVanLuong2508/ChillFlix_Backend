import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { IUser } from '../users/interface/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { joinWithCommonFields } from 'src/common/utils/join-allcode';
import { plainToInstance } from 'class-transformer';
import { RoleResponseDto } from './dto/role-response.dto';
import { RolePermission } from '../role_permission/entities/role_permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
  ) {}
  async create(createRoleDto: CreateRoleDto, user: IUser) {
    try {
      const { roleName, description, isActive, permissionIds } = createRoleDto;

      const isExist = await this.roleRepository.exists({
        where: { roleName: roleName },
      });

      if (isExist) {
        return {
          EC: 2,
          EM: `Role ${roleName} is already exist`,
        };
      } else {
        //tạo role
        const newRole = await this.roleRepository.save({
          roleName,
          description,
          isActive,
          createdBy: user.userId,
        });

        //tạo role_permission

        if (permissionIds?.length > 0) {
          const records = permissionIds.map((perId) => ({
            roleId: newRole.roleId,
            permissionId: perId,
            createdBy: user.userId,
          }));

          await this.rolePermissionRepository.save(records);
        }

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
      const result = await this.roleRepository.find({
        where: { isDeleted: false },
        select: {
          roleId: true,
          roleName: true,
          description: true,
          isActive: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
        },
      });
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
      const isExist = await this.roleRepository.exists({
        where: { roleId: id, isDeleted: false },
      });
      if (!isExist) {
        return {
          EC: 0,
          EM: 'Role not found',
        };
      }

      const queryBuilder = this.roleRepository.createQueryBuilder('role');
      queryBuilder.leftJoinAndSelect('role.rolePermission', 'rolePermission');
      joinWithCommonFields(queryBuilder, 'rolePermission.permission', 'permission');

      const role = await queryBuilder.where('role.roleId = :roleId', { roleId: id }).getOne();
      const data = plainToInstance(RoleResponseDto, role);
      return {
        EC: 1,
        EM: 'Find a role success',
        role: data,
      };
    } catch (error: any) {
      console.error('Error in findOne role:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from findOne role service',
      });
    }
  }

  async finOneById(id: number) {
    try {
      const role = await this.roleRepository.findOne({
        where: { roleId: id, isDeleted: false },
        relations: {
          rolePermission: true,
        },
        select: {
          roleId: true,
          roleName: true,
          description: true,
          isActive: true,
          rolePermission: true,
        },
      });

      if (!role) {
        return {
          EC: 0,
          EM: 'Role not found',
        };
      }

      return {
        EC: 1,
        EM: 'Find a role success',
        ...role,
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
      const { permissionIds, ...roleFields } = updateRoleDto;
      await this.roleRepository.update(
        {
          roleId: id,
        },
        {
          ...roleFields,
          updatedAt: new Date(),
          updatedBy: user.userId,
        },
      );

      // Nếu không cập nhật permission
      if (!permissionIds) {
        return { EC: 1, EM: 'Update role success' };
      }

      // Lấy permission cũ
      const oldRolePermission_Record = await this.rolePermissionRepository.find({
        where: { roleId: id },
      });

      const oldIds = oldRolePermission_Record.map((rp) => rp.permissionId);

      // Xác định cần thêm và cần xoá, t mệt vl
      const idToAdds = permissionIds.filter((pid) => !oldIds.includes(pid));
      console.log('check to add: ', idToAdds);

      const idToRemoves = oldIds.filter((pid) => !permissionIds.includes(pid));
      console.log('check to toRemove: ', idToRemoves);

      // Thêm mới
      if (idToAdds.length > 0) {
        await this.rolePermissionRepository.save(
          idToAdds.map((pid) => ({
            roleId: id,
            permissionId: pid,
            createdBy: user.userId,
          })),
        );
      }

      if (idToRemoves.length > 0) {
        await this.rolePermissionRepository.delete({
          roleId: id,
          permissionId: In(idToRemoves),
        });
      }

      return {
        EC: 1,
        EM: 'Update Role success',
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
