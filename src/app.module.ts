import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { DatabasesModule } from 'src/databases/databases.module';
import { AllCodesModule } from 'src/modules/all-codes/all-codes.module';
import { AllCode } from 'src/modules/all-codes/entities/all-code.entity';
import { AuthModule } from 'src/modules/auth/auth.module';
import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { PermissionsModule } from 'src/modules/permissions/permissions.module';
import { Role } from 'src/modules/roles/entities/role.entity';
import { RolesModule } from 'src/modules/roles/roles.module';
import { User } from 'src/modules/users/entities/user.entity';
import { UsersModule } from 'src/modules/users/users.module';
import { RolePermissionModule } from './modules/role_permission/role_permission.module';
import { Director } from 'src/modules/directors/director.entity';
import { DirectorModule } from 'src/modules/directors/director.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') || '5432'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, AllCode, Permission, Role, Director],
        synchronize: true,
      }),
    }),
    UsersModule,
    AllCodesModule,
    AuthModule,
    DatabasesModule,
    PermissionsModule,
    RolesModule,
    RolePermissionModule,
    DirectorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
