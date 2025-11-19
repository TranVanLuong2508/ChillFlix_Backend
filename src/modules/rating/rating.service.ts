import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { IUser } from '../users/interface/user.interface';
import { Film } from '../films/entities/film.entity';
import { RatingGateway } from './socket/rating-gateway';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,

    @InjectRepository(Film)
    private readonly filmRepo: Repository<Film>,

    private readonly ratingGateway: RatingGateway,
  ) {}

  async createRating(dto: CreateRatingDto, user: IUser) {
    try {
      const film = await this.filmRepo.findOne({ where: { filmId: dto.filmId } });
      if (!film) return { EC: 0, EM: 'Film not found' };

      const existing = await this.ratingRepo
        .createQueryBuilder('rating')
        .withDeleted()
        .leftJoinAndSelect('rating.user', 'user')
        .leftJoinAndSelect('rating.film', 'film')
        .where('rating.userId = :userId', { userId: user.userId })
        .andWhere('rating.filmId = :filmId', { filmId: dto.filmId })
        .getOne();

      let result;
      let isUpdate = false;

      if (existing) {
        existing.ratingValue = dto.ratingValue;
        existing.content = dto.content || existing.content;
        existing.updatedBy = user.userId;

        if (existing.deletedAt) {
          existing.deletedAt = undefined;
          existing.deletedBy = undefined;
        }

        result = await this.ratingRepo.save(existing);
        isUpdate = true;
      } else {
        const newRating = this.ratingRepo.create({
          ratingValue: dto.ratingValue,
          content: dto.content,
          user: { userId: user.userId } as any,
          film: { filmId: dto.filmId } as any,
          createdBy: user.userId,
        });
        result = await this.ratingRepo.save(newRating);
      }

      const stats = await this.getRatingsByFilm(dto.filmId);
      this.ratingGateway.broadcastRatingUpdate({
        filmId: dto.filmId,
        averageRating: stats.result.averageRating,
        totalRatings: stats.result.totalRatings,
        newRating: {
          ratingId: result.ratingId,
          ratingValue: result.ratingValue,
          content: result.content,
          createdAt: result.createdAt,
          user: {
            id: user.userId,
            name: user.fullName,
            // avatar: user.avatarUrl,
          },
        },
      });

      return {
        EC: 1,
        EM: isUpdate ? 'Cập nhật đánh giá thành công' : 'Tạo đánh giá thành công',
        result,
      };
    } catch (error) {
      console.error('Error in createRating:', error);

      if (error.code === '23505') {
        return {
          EC: 0,
          EM: 'You have already rated this film. Please refresh the page to update your rating.',
        };
      }

      return { EC: 0, EM: 'Error creating rating: ' + error.message };
    }
  }

  async getRatingsByFilm(filmId: string) {
    const ratings = await this.ratingRepo.find({
      where: { film: { filmId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    const average =
      ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.ratingValue, 0) / ratings.length : 0;

    return {
      EC: 1,
      EM: 'Get ratings successfully',
      result: {
        averageRating: Number(average.toFixed(2)),
        totalRatings: ratings.length,
        list: ratings.map((r) => ({
          ratingId: r.ratingId,
          ratingValue: r.ratingValue,
          content: r.content,
          createdAt: r.createdAt,
          user: {
            id: r.user.userId,
            name: r.user.fullName,
            avatar: r.user.avatarUrl,
          },
        })),
      },
    };
  }

  async getEverage(filmId: string) {
    const ratings = await this.ratingRepo.find({
      where: {
        film: {
          filmId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
    const average =
      ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.ratingValue, 0) / ratings.length : 0;

    return { average: average };
  }

  async deleteRating(ratingId: string, user: IUser) {
    const rating = await this.ratingRepo.findOne({
      where: { ratingId },
      relations: ['user', 'film'],
    });
    if (!rating) return { EC: 0, EM: 'Rating not found' };

    if (rating.user.userId !== user.userId)
      return { EC: 0, EM: 'You are not allowed to delete this rating' };
    const filmId = rating.film.filmId;
    await this.ratingRepo.remove(rating);
    const stats = await this.getRatingsByFilm(filmId);
    this.ratingGateway.broadcastRatingDelete({
      filmId,
      ratingId,
    });
    this.ratingGateway.broadcastRatingUpdate({
      filmId,
      averageRating: stats.result.averageRating,
      totalRatings: stats.result.totalRatings,
    });

    return { EC: 1, EM: 'Xóa đánh giá thành công' };
  }
}
