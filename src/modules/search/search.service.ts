import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateSearchDto } from './dto/create-search.dto';
import { UpdateSearchDto } from './dto/update-search.dto';
import { filmIndexMapping } from './film.mapping';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly filmIndex = 'films';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}
  async onModuleInit() {
    console.log('nitializing Elasticsearch...');
    // Tạo index khi khởi động ứng dụng nếu chưa  có
    await this.createIndex();
  }

  async createIndex() {
    const filmsIndexExists = await this.elasticsearchService.indices.exists({
      index: this.filmIndex,
    });

    console.log('chekc ineex', filmsIndexExists);

    if (!filmsIndexExists) {
      await this.elasticsearchService.indices.create({
        index: this.filmIndex,
        body: {
          settings: filmIndexMapping.settings,
          mappings: filmIndexMapping.mappings,
        },
      });

      console.log(`Created Elasticsearch index: ${this.filmIndex} `);
    }
  }

  // Index 1 film vào Elasticsearch
  async indexFilm(film: any) {
    try {
      await this.elasticsearchService.index({
        index: this.filmIndex,
        id: film.filmId,
        document: {
          filmId: film.filmId,
          title: film.title,
          originalTitle: film.originalTitle,
          thumbUrl: film.thumbUrl,
          slug: film.slug,
          year: film.year,
          description: film.description,
        },
      });
      return { message: 'Indexed film successfully' };
    } catch (error) {
      console.error('Index film error:', error);
    }
  }

  async bulkIndexFilms(films: any[]) {
    try {
      const operations = films.flatMap((film) => [
        { index: { _index: this.filmIndex, _id: film.filmId } },
        {
          filmId: film.filmId,
          title: film.title,
          originalTitle: film.originalTitle,
          thumbUrl: film.thumbUrl,
          slug: film.slug,
          year: film.year,
          description: film.description,
        },
      ]);
      await this.elasticsearchService.bulk({
        refresh: true,
        operations,
      });

      return { message: 'Bulk index completed' };
    } catch (error) {
      console.error('Bulk index error:', error);
    }
  }

  async searchFilms(keyword: string) {
    try {
      const result = await this.elasticsearchService.search({
        index: this.filmIndex,
        query: {
          multi_match: {
            query: keyword,
            fields: ['title^3', 'originalTitle^2'], // ưu tiên title hơn
            fuzziness: 'AUTO', // sửa lỗi chính tả
          },
        },
        size: 20,
      });

      return result.hits.hits.map((hit) => hit._source);
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  async deleteIndexFilm() {
    await this.elasticsearchService.indices.delete({
      index: this.filmIndex,
    });

    console.log('Deleted index films');
  }

  async getAllFilmsFromIndex() {
    const result = await this.elasticsearchService.search({
      index: this.filmIndex,
      query: { match_all: {} },
      size: 1000,
    });

    return result.hits.hits.map((h) => h._source);
  }
}
