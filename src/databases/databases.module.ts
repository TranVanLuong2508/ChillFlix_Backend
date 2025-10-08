import { Module } from '@nestjs/common';
import { DatabasesService } from './databases.service';
import { DatabasesController } from './databases.controller';
import { AllCodesService } from 'src/all-codes/all-codes.service';
import { AllCode } from 'src/all-codes/entities/all-code.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { Permission } from 'src/permissions/entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AllCode, User, Permission])],
  controllers: [DatabasesController],
  providers: [DatabasesService, AllCodesService, UsersService],
  exports: [AllCodesService],
})
export class DatabasesModule {}
