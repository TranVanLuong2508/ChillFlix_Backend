import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IUser } from 'src/users/interface/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}
  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    const { name, apiPath, module, method } = createPermissionDto;
    const isPermissionExist = await this.permissionRepository.findOne({
      where: { apiPath: apiPath, method: method },
    });

    if (isPermissionExist) {
      throw new BadRequestException(`Permission with apiPath=${apiPath} , method=${method} is already exist`);
    }

    const newPermission = this.permissionRepository.create({
      name,
      apiPath,
      module,
      method,
      createdBy: user.userId,
    });

    await this.permissionRepository.save(newPermission);

    return {
      permissionId: newPermission?.permissionId,
      createdAt: newPermission?.createdAt,
    };
  }

  async findAll() {
    return await this.permissionRepository.find({});
  }

  async findOne(id: number) {
    const foundPermission = await this.permissionRepository.findOne({
      where: { permissionId: id },
      select: {
        permissionId: true,
        name: true,
        method: true,
        module: true,
        createdBy: true,
      },
    });
    if (!foundPermission) {
      throw new BadRequestException('not found permission');
    }

    return foundPermission;
  }

  update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return `This action updates a #${id} permission`;
  }

  remove(id: number) {
    return `This action removes a #${id} permission`;
  }
}
