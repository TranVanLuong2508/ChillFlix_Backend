import { IsNull, Repository, Not } from 'typeorm';
import { Injectable, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { IUser } from '../users/interface/user.interface';
import aqp from 'api-query-params';
import { CommentGateway } from './socket/comment-gateway';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    private readonly commentGateway: CommentGateway,
  ) {}

  async createComment(dto: CreateCommentDto, user: IUser) {
    try {
      if (!user || !user.userId) {
        return {
          EC: 0,
          EM: 'Unauthorized: user not found in request',
        };
      }

      const comment = this.commentRepo.create({
        content: dto.content?.trim(),
        user: { userId: user.userId } as any,
        film: { filmId: dto.filmId } as any,
        part: dto.partId ? ({ partId: dto.partId } as any) : undefined,
        episode: dto.episodeId ? ({ episodeId: dto.episodeId } as any) : undefined,
        parent: dto.parentId ? ({ commentId: dto.parentId } as any) : undefined,
      });

      comment.createdBy = user.userId;

      const savedComment = await this.commentRepo.save(comment);

      let parentComment: Comment | null = null;
      if (dto.parentId) {
        parentComment = await this.commentRepo.findOne({
          where: { commentId: dto.parentId },
          relations: ['user', 'parent', 'parent.user'],
        });

        if (parentComment) {
          await this.commentRepo.increment(
            { commentId: parentComment.commentId },
            'totalChildrenComment',
            1,
          );
        }
      }

      const fullComment = await this.commentRepo.findOne({
        where: { commentId: savedComment.commentId },
        relations: ['user', 'parent', 'parent.user'],
      });

      if (fullComment) {
        this.commentGateway.broadcastNewComment(fullComment);

        if (dto.parentId && parentComment?.user) {
          this.commentGateway.broadcastReplyComment({
            parentId: parentComment.commentId,
            replyToUser: parentComment.user,
            replyComment: fullComment,
          });
        }
      }
      await this.countCommentsByFilm(dto.filmId);
      return {
        EC: 1,
        EM: 'Create comment successfully',
        fullComment,
      };
    } catch (error) {
      console.error('Error in createComment:', error?.message || error);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from createComment service',
      });
    }
  }
  async findCommentsByFilm(query: any, filmId: string, user: IUser | null) {
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
        where: {
          film: { filmId },
          parent: IsNull(),
          isHidden: false,
          ...filter,
        },
        relations: [
          'user',
          'children',
          'children.user',
          'reactions',
          'children.reactions',
          'reactions.user',
          'children.reactions.user',
        ],
        order: {
          createdAt: 'DESC',
          children: { createdAt: 'ASC' },
        },
        skip,
        take: limit,
      });

      const userId = user?.userId || null;
      const comments = data.map((comment) => buildTree(comment, userId));

      return {
        EC: 1,
        EM: 'Get comments successfully',
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        comments,
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
      if (!comment) return { EC: 0, EM: 'Comment not found' };

      const result = {
        id: comment.commentId,
        content: comment.content,
        createdAt: comment.createdAt,
        isHidden: comment.isHidden,
        user: {
          id: comment.user.userId,
          name: comment.user.fullName,
          avatar: comment.user.avatarUrl,
        },
        replies:
          comment.children
            ?.filter((child) => !child.isHidden)
            .map((child) => ({
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
        EM: 'Error from getComment service',
      });
    }
  }
  async updateComment(commentId: string, dto: UpdateCommentDto, user: IUser) {
    try {
      const comment = await this.commentRepo.findOne({
        where: { commentId },
        relations: ['user'],
      });

      if (!comment) return { EC: 0, EM: 'Comment not found' };
      if (comment.user.userId !== user.userId) {
        return {
          EC: 0,
          EM: 'You are not allowed to update this comment (only owner can edit)',
        };
      }

      Object.assign(comment, dto);
      comment.updatedBy = user.userId;

      const updated = await this.commentRepo.save(comment);

      const result = await this.commentRepo.findOne({
        where: { commentId: updated.commentId },
        relations: ['user'],
      });
      this.commentGateway.broadcastUpdateComment(result);
      return {
        EC: 1,
        EM: 'Update comment successfully',
        result,
      };
    } catch (error) {
      console.error('Error in updateComment:', error);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from updateComment service',
      });
    }
  }

  async deleteComment(commentId: string, user: IUser) {
    try {
      const comment = await this.commentRepo.findOne({
        where: { commentId },
        relations: ['user', 'parent', 'children', 'film'],
      });

      if (!comment) return { EC: 0, EM: 'Comment not found' };

      const canDelete = comment.user.userId === user.userId;

      if (!canDelete) return { EC: 0, EM: 'You are not allowed to remove this comment' };

      if (comment.children && comment.children.length > 0) {
        for (const child of comment.children) {
          await this.commentRepo.update(child.commentId, { deletedBy: user.userId });
          await this.commentRepo.softDelete({ commentId: child.commentId });
          this.commentGateway.broadcastDeleteComment(child.commentId);
          await this.countCommentsByFilm(comment.film.filmId);
        }
      }
      if (comment.parent) {
        await this.commentRepo.decrement(
          { commentId: comment.parent.commentId },
          'totalChildrenComment',
          1,
        );
      }
      await this.commentRepo.update(commentId, { deletedBy: user.userId });
      await this.commentRepo.softDelete({ commentId });
      this.commentGateway.broadcastDeleteComment(commentId);

      return { EC: 1, EM: 'Delete comment successfully' };
    } catch (error) {
      console.error('Error in deleteComment:', error);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from deleteComment service',
      });
    }
  }

  async toggleHideComment(commentId: string, user: IUser) {
    try {
      const comment = await this.commentRepo.findOne({ where: { commentId } });
      if (!comment) return { EC: 0, EM: 'Comment not found' };

      if (![1, 2].includes(user.roleId)) {
        return {
          EC: 0,
          EM: 'You are not allowed to hide/unhide this comment (only admin/moderator can perform this action)',
        };
      }

      comment.isHidden = !comment.isHidden;
      comment.updatedBy = user.userId;
      await this.commentRepo.save(comment);
      this.commentGateway.broadcastHideComment(commentId, comment.isHidden);

      return {
        EC: 1,
        EM: comment.isHidden ? 'Comment hidden successfully' : 'Comment is now visible',
        data: {
          commentId: comment.commentId,
          isHidden: comment.isHidden,
        },
      };
    } catch (error) {
      console.error('Error in toggleHideComment:', error);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from toggleHideComment service',
      });
    }
  }

  async countCommentsByFilm(filmId: string) {
    try {
      const total = await this.commentRepo.count({
        where: {
          film: { filmId },
          isHidden: false,
          deletedAt: IsNull(),
        },
      });
      this.commentGateway.broadcastCountComments({ filmId, total });
      return {
        EC: 1,
        EM: 'Count comments successfully',
        totalComments: total,
      };
    } catch (error) {
      console.error('Error in countCommentsByFilm:', error);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from countCommentsByFilm service',
      });
    }
  }
}

function buildTree(comment: any, userId: string | number | null): any {
  const currentReaction = userId ? comment.reactions?.find((r) => r.user?.userId === userId) : null;
  return {
    id: comment.commentId,
    content: comment.content,
    createdAt: comment.createdAt,
    totalLike: comment.totalLike,
    totalDislike: comment.totalDislike,
    totalChildrenComment: comment.totalChildrenComment,
    currentUserReaction: userId ? currentReaction?.type || null : undefined,
    user: {
      id: comment.user.userId,
      name: comment.user.fullName,
      avatar: comment.user.avatarUrl,
    },
    replies: (comment.children || [])
      .filter((child) => !child.isHidden)
      .map((child) => buildTree(child, userId)),
  };
}
