import { Module } from '@nestjs/common';
import { DatabasesService } from './databases.service';
import { DatabasesController } from './databases.controller';
import { AllCodesService } from 'src/modules/all-codes/all-codes.service';
import { AllCode } from 'src/modules/all-codes/entities/all-code.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { UsersService } from 'src/modules/users/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([AllCode, User, Permission])],
  controllers: [DatabasesController],
  providers: [DatabasesService, AllCodesService, UsersService],
  exports: [AllCodesService],
})
export class DatabasesModule {}
