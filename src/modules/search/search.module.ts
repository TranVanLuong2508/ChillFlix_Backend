import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchService } from './search.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        node: configService.get<string>('ELASTICSEARCH_NODE')!,
        auth: {
          username: configService.get<string>('ELASTICSEARCH_USERNAME')!,
          password: configService.get<string>('ELASTICSEARCH_PASSWORD')!,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
