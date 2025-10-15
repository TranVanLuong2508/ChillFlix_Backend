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
import { Director } from 'src/modules/directors/entities/director.entity';
import { DirectorModule } from 'src/modules/directors/director.module';
import { FilmsModule } from './modules/films/films.module';
import { Film } from 'src/modules/films/entities/film.entity';
import { FileModule } from './modules/file/file.module';
import { FilmDirectorModule } from './modules/film_director/film_director.module';
import { FilmDirector } from './modules/film_director/entities/film_director.entity';
import { ActorModule } from './modules/actor/actor.module';
import { Actor } from './modules/actor/entities/actor.entity';
import { FilmActorModule } from './modules/film_actor/film_actor.module';
import { FilmActor } from './modules/film_actor/entities/film_actor.entity';

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
        entities: [User, AllCode, Permission, Role, Director, Film, FilmDirector, Actor, FilmActor],
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
    FilmsModule,
    FileModule,
    FilmDirectorModule,
    ActorModule,
    FilmActorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
