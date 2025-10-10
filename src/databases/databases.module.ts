import { Module } from '@nestjs/common';
import { DatabasesService } from './databases.service';
import { DatabasesController } from './databases.controller';
import { AllCodesService } from 'src/modules/all-codes/all-codes.service';
import { AllCode } from 'src/modules/all-codes/entities/all-code.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { UsersService } from 'src/modules/users/users.service';
import { DirectorService } from 'src/modules/directors/director.service';
import { Director } from 'src/modules/directors/director.entity';
import { RolePermissionService } from 'src/modules/role_permission/role_permission.service';
import { RolePermission } from 'src/modules/role_permission/entities/role_permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AllCode, User, Permission, Director, RolePermission])],
  controllers: [DatabasesController],
  providers: [DatabasesService, AllCodesService, UsersService, DirectorService, RolePermissionService],
  exports: [AllCodesService],
})
export class DatabasesModule {}
