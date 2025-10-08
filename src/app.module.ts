import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DirectorModule } from './modules/directors/director.module';
import { DatabasesModule } from './databases/databases.module';
import { AllCodesModule } from './modules/allcodes/allcodes.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT as unknown as number,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    DirectorModule,
    DatabasesModule,
    AllCodesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
