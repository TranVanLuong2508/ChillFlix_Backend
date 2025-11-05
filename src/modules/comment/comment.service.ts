import { IsNull, Repository } from 'typeorm';
import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { IUser } from '../users/interface/user.interface';
import aqp from 'api-query-params';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  async createComment(dto: CreateCommentDto, user: IUser) {
    try {
      const comment = this.commentRepo.create({
        content: dto.content,
        user: { userId: user.userId } as any,
        film: { filmId: dto.filmId } as any,
        part: dto.partId ? ({ partId: dto.partId } as any) : undefined,
        episode: dto.episodeId ? ({ episodeId: dto.episodeId } as any) : undefined,
        parent: dto.parentId ? ({ commentId: dto.parentId } as any) : undefined,
      });
      comment.createdBy = user.userId;
      const savedComment = await this.commentRepo.save(comment);

      if (dto.parentId) {
        const parent = await this.commentRepo.findOneBy({ commentId: dto.parentId });
        if (parent) {
          await this.commentRepo.increment({ commentId: dto.parentId }, 'totalChildrenComment', 1);
        }
      }
      const fullComment = await this.commentRepo.findOne({
        where: { commentId: savedComment.commentId },
        relations: ['user'],
      });

      return { EC: 1, EM: 'Create comment successfully', fullComment };
    } catch (error) {
      console.error('Error in create comment:', error);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from create comment service',
      });
    }
  }
  async findCommentsByFilm(query: any, filmId: string) {
    try {
      const { filter, sort } = aqp(query);
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 5;
      const skip = (page - 1) * limit;

      delete filter.page;
      delete filter.limit;
      delete filter.skip;
      delete filter.sort;

      const order = sort || { createdAt: 'DESC' };

      const [data, total] = await this.commentRepo.findAndCount({
        where: { film: { filmId }, parent: IsNull(), ...filter },
        relations: ['user', 'children', 'children.user'],
        order: { createdAt: 'DESC', children: { createdAt: 'ASC' } },
        skip,
        take: limit,
      });

      const comments = data.map((comment) => ({
        id: comment.commentId,
        content: comment.content,
        createdAt: comment.createdAt,
        user: {
          id: comment.user.userId,
          name: comment.user.fullName,
          avatar: comment.user.avatarUrl,
        },
        replies:
          comment.children?.map((child) => ({
            id: child.commentId,
            content: child.content,
            createdAt: child.createdAt,
            user: {
              id: child.user.userId,
              name: child.user.fullName,
              avatar: child.user.avatarUrl,
            },
          })) || [],
      }));

      if (total === 0)
        return {
          EC: 1,
          EM: 'No comments found',
          meta: { page, limit, total, totalPages: 0 },
        };

      return {
        EC: 1,
        EM: 'Get comments successfully',
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        data: comments,
      };
    } catch (error) {
      console.error('Error in findCommentsByFilm:', error);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from findCommentsByFilm service',
      });
    }
  }

  async getComment(commentId: string) {
    try {
      const comment = await this.commentRepo.findOne({
        where: { commentId },
        relations: ['user', 'children', 'children.user'],
      });
      if (!comment) throw new NotFoundException('Comment not found');
      const result = {
        id: comment.commentId,
        content: comment.content,
        createdAt: comment.createdAt,
        user: {
          id: comment.user.userId,
          name: comment.user.fullName,
          avatar: comment.user.avatarUrl,
        },
        replies:
          comment.children?.map((child) => ({
            id: child.commentId,
            content: child.content,
            createdAt: child.createdAt,
            user: {
              id: child.user.userId,
              name: child.user.fullName,
              avatar: child.user.avatarUrl,
            },
          })) || [],
      };
      return { EC: 1, EM: 'Get comment successfully', result };
    } catch (error) {
      console.error('Error in getComment:', error);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from getComment comment service',
      });
    }
  }

  async updateComment(commentId: string, dto: UpdateCommentDto, user: IUser) {
    try {
      const comment = await this.commentRepo.findOne({
        where: { commentId },
        relations: ['user'],
      });

      if (!comment) throw new NotFoundException('Comment not found');
      if (comment.user.userId !== user.userId) {
        return { EC: 0, EM: 'You are not allowed to update this comment' };
      }

      Object.assign(comment, dto);
      comment.updatedBy = user.userId;
      const updated = await this.commentRepo.save(comment);
      const result = {
        commentId: updated.commentId,
        content: updated.content,
        updatedAt: updated.updatedAt,
        updatedBy: updated.updatedBy,
      };

      return { EC: 1, EM: 'Update comment successfully', result };
    } catch (error) {
      console.error('Error in update comment:', error);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from update comment service',
      });
    }
  }

  async deleteComment(commentId: string, user: IUser) {
    try {
      const comment = await this.commentRepo.findOne({
        where: { commentId },
        relations: ['user', 'parent'],
      });

      if (!comment) return { EC: 0, EM: 'Comment not found' };
      if (comment.user.userId !== user.userId) return { EC: 0, EM: 'You are not allowed to remove this comment' };

      if (comment.parent) {
        await this.commentRepo.decrement({ commentId: comment.parent.commentId }, 'totalChildrenComment', 1);
      }

      await this.commentRepo.update(commentId, { deletedBy: user.userId });
      await this.commentRepo.softDelete({ commentId });
      return { EC: 1, EM: 'Delete comment successfully' };
    } catch (error) {
      console.error('Error in deleteComment:', error);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from deleteComment comment service',
      });
    }
  }
}
