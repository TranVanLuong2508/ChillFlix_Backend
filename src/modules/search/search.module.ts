import { forwardRef, Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchService } from './search.service';
import { ConfigService } from '@nestjs/config';
import { FilmsModule } from '../films/films.module';
import { FilmsService } from '../films/films.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Film } from '../films/entities/film.entity';
import { ActorSearchService } from './actorSearch.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Film]),
    forwardRef(() => FilmsModule),
    ElasticsearchModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        node: 'http://localhost:9200',
        // auth: {
        //   username: configService.get<string>('ELASTICSEARCH_USERNAME')!,
        //   password: configService.get<string>('ELASTICSEARCH_PASSWORD')!,
        // },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SearchController],
  providers: [SearchService, ActorSearchService],
  exports: [SearchService, ActorSearchService],
})
export class SearchModule {}
