import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { IUser } from '../users/interface/user.interface';
import { Film } from '../films/entities/film.entity';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,

    @InjectRepository(Film)
    private readonly filmRepo: Repository<Film>,
  ) {}

  async createRating(dto: CreateRatingDto, user: IUser) {
    const film = await this.filmRepo.findOne({ where: { filmId: dto.filmId } });
    if (!film) return { EC: 0, EM: 'Film not found' };

    const existing = await this.ratingRepo.findOne({
      where: { film: { filmId: dto.filmId }, user: { userId: user.userId } },
      relations: ['film', 'user'],
    });

    if (existing) {
      existing.ratingValue = dto.ratingValue;
      existing.content = dto.content || existing.content;
      existing.updatedBy = user.userId;
      const updated = await this.ratingRepo.save(existing);

      return { EC: 1, EM: 'Updated rating successfully', updated };
    }

    const newRating = this.ratingRepo.create({
      ratingValue: dto.ratingValue,
      content: dto.content,
      user: { userId: user.userId } as any,
      film: { filmId: dto.filmId } as any,
      createdBy: user.userId,
    });

    const result = await this.ratingRepo.save(newRating);
    return { EC: 1, EM: 'Created rating successfully', result };
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
        averageRating: Number(average.toFixed(1)),
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
      relations: ['user'],
    });
    if (!rating) return { EC: 0, EM: 'Rating not found' };

    if (rating.user.userId !== user.userId)
      return { EC: 0, EM: 'You are not allowed to delete this rating' };

    await this.ratingRepo.update(ratingId, { deletedBy: user.userId });
    await this.ratingRepo.softDelete({ ratingId });

    return { EC: 1, EM: 'Deleted rating successfully' };
  }
}
