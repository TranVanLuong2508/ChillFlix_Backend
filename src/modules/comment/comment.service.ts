import { IsNull, Repository, Not, In } from 'typeorm';
import { Injectable, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { CommentReport } from './entities/report.entity';
import { User } from '../users/entities/user.entity';
import { IUser } from '../users/interface/user.interface';
import aqp from 'api-query-params';
import { CommentGateway } from './socket/comment-gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(CommentReport)
    private readonly reportRepo: Repository<CommentReport>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly commentGateway: CommentGateway,
    private readonly notificationsService: NotificationsService,
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
        relations: ['user', 'parent', 'parent.user', 'film'],
      });

      if (fullComment) {
        this.commentGateway.broadcastNewComment(fullComment);
        if (dto.parentId && parentComment?.user) {
          const targetUserId = parentComment.user.userId;
          this.commentGateway.broadcastReplyComment({
            parentId: parentComment.commentId,
            replyToUser: parentComment.user,
            replyComment: fullComment,
          });

          //socket.io notification
          if (targetUserId !== user.userId) {
            this.commentGateway.sendReplyNotification(String(targetUserId), {
              targetUserId,
              parentId: parentComment.commentId,
              replyToUser: parentComment.user,
              replyComment: fullComment,
            });

            // save notification to db
            try {
              const filmTitle = fullComment.film?.title;
              const notification = await this.notificationsService.createNotification({
                userId: targetUserId,
                type: 'reply',
                message: `${fullComment.user.fullName} đã trả lời bình luận của bạn trong ${filmTitle}`,
                replierId: user.userId,
                result: {
                  commentId: fullComment.commentId,
                  parentId: parentComment.commentId,
                  filmId: dto.filmId,
                  slug: fullComment.film?.slug,
                  filmTitle: filmTitle,
                },
              });
            } catch (notifError) {
              console.error('[NOTIFICATION] Error creating notification:', notifError);
            }
          }
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

  async getAllComments(query: any, user: IUser) {
    try {
      const { filter, sort } = aqp(query);
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const skip = (page - 1) * limit;

      delete filter.page;
      delete filter.limit;
      delete filter.skip;
      delete filter.sort;

      const [data, total] = await this.commentRepo.findAndCount({
        where: {
          parent: IsNull(),
          ...filter,
        },
        relations: ['user', 'film', 'reactions', 'reactions.user'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      // Load children comments recursively for each root comment
      for (const root of data) {
        root.children = await loadChildrenRecursive(this.commentRepo, root.commentId);
      }

      const userId = user?.userId || null;
      const comments = data.map((comment) => buildTree(comment, userId));

      return {
        EC: 1,
        EM: 'Get all comments successfully',
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        comments,
      };
    } catch (error) {
      console.error('Error in getAllComments:', error);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from getAllComments service',
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
        relations: ['user', 'reactions', 'reactions.user'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });
      for (const root of data) {
        root.children = await loadChildrenRecursive(this.commentRepo, root.commentId);
      }

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

  private async deleteChildrenRecursive(commentId: string, userId: number) {
    const children = await this.commentRepo.find({
      where: { parent: { commentId }, deletedAt: IsNull() },
      relations: ['children'],
    });

    for (const child of children) {
      await this.deleteChildrenRecursive(child.commentId, userId);
      await this.commentRepo.update(child.commentId, { deletedBy: userId });
      await this.commentRepo.softDelete(child.commentId);
      this.commentGateway.broadcastDeleteComment(child.commentId);
    }
  }

  async deleteComment(commentId: string, user: IUser) {
    try {
      const comment = await this.commentRepo.findOne({
        where: { commentId },
        relations: ['user', 'parent', 'film'],
      });

      if (!comment) return { EC: 0, EM: 'Comment not found' };

      if (comment.user.userId !== user.userId)
        return { EC: 0, EM: 'You are not allowed to remove this comment' };

      const filmId = comment.film.filmId;
      await this.deleteChildrenRecursive(commentId, user.userId);
      if (comment.parent) {
        await this.commentRepo.decrement(
          { commentId: comment.parent.commentId },
          'totalChildrenComment',
          1,
        );
      }
      await this.commentRepo.update(commentId, { deletedBy: user.userId });
      await this.commentRepo.softDelete(commentId);
      this.commentGateway.broadcastDeleteComment(commentId);
      const total = await this.commentRepo.count({
        where: { film: { filmId }, deletedAt: IsNull() },
      });

      this.commentGateway.broadcastCountComments({
        filmId,
        total,
      });

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
      const comment = await this.commentRepo.findOne({
        where: { commentId },
        relations: ['children', 'user', 'film'],
      });

      if (!comment) return { EC: 0, EM: 'Comment not found' };

      if (user.roleName !== 'SYSTEM_ADMIN' && user.roleName !== 'ROLE_MOD') {
        return {
          EC: 0,
          EM: 'You are not allowed to hide/unhide this comment (only admin/moderator can perform this action)',
        };
      }

      const newHiddenState = !comment.isHidden;
      comment.isHidden = newHiddenState;
      comment.updatedBy = user.userId;
      await this.commentRepo.save(comment);
      await this.toggleHideChildrenRecursive(commentId, newHiddenState, user.userId);

      // Khi ẩn: broadcast hide event
      if (newHiddenState) {
        this.commentGateway.broadcastHideComment(commentId, newHiddenState);
      } else {
        // Khi hiện: broadcast full comment data kèm children
        const fullComment = await this.commentRepo.findOne({
          where: { commentId },
          relations: ['user', 'parent', 'parent.user', 'film', 'reactions', 'reactions.user'],
        });
        if (fullComment) {
          // Load children recursively
          fullComment.children = await loadChildrenRecursive(
            this.commentRepo,
            fullComment.commentId,
          );
          this.commentGateway.broadcastUnhideComment(fullComment);
        }
      }

      // gửi thông báo khi bị ẩn
      if (newHiddenState && comment.user) {
        const commentOwnerId = comment.user.userId;

        try {
          const filmTitle = comment.film?.title || 'Unknown';
          const notification = await this.notificationsService.createNotification({
            userId: commentOwnerId,
            type: 'hidden_comment',
            message: `Bình luận của bạn trong phim "${filmTitle}" đã bị ẩn do vi phạm nguyên tắc cộng đồng`,
            result: {
              commentId: comment.commentId,
              commentContent: comment.content,
              filmId: comment.film?.filmId,
              filmTitle: filmTitle,
              filmSlug: comment.film?.slug,
              hiddenAt: new Date(),
            },
          });

          // Gửi realtime notification
          this.commentGateway.sendHiddenCommentNotification(commentOwnerId, {
            notificationId: notification.notificationId,
            commentId: comment.commentId,
            message: `Bình luận của bạn trong phim "${filmTitle}" đã bị ẩn do vi phạm nguyên tắc cộng đồng`,
            film: comment.film
              ? {
                  filmId: comment.film.filmId,
                  title: comment.film.title,
                  slug: comment.film.slug,
                }
              : null,
            createdAt: new Date(),
          });
        } catch (notifError) {
          console.error('[NOTIFICATION] Error creating hidden comment notification:', notifError);
        }
      }

      // Cập nhật số bình luận
      if (comment.film?.filmId) {
        await this.countCommentsByFilm(comment.film.filmId);
      }

      return {
        EC: 1,
        EM: newHiddenState ? 'Comment hidden successfully' : 'Comment is now visible',
        data: {
          commentId: comment.commentId,
          isHidden: newHiddenState,
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
  private async toggleHideChildrenRecursive(parentId: string, isHidden: boolean, userId: number) {
    const children = await this.commentRepo.find({
      where: { parent: { commentId: parentId } },
      relations: ['children'],
    });

    for (const child of children) {
      child.isHidden = isHidden;
      child.updatedBy = userId;
      await this.commentRepo.save(child);
      this.commentGateway.broadcastHideComment(child.commentId, isHidden);
      if (child.children && child.children.length > 0) {
        await this.toggleHideChildrenRecursive(child.commentId, isHidden, userId);
      }
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

  async reportComment(commentId: string, reason: string, description: string, user: IUser) {
    try {
      const comment = await this.commentRepo.findOne({
        where: { commentId },
        relations: ['user', 'film'],
      });

      if (!comment) {
        return {
          EC: 0,
          EM: 'Comment not found',
        };
      }

      if (comment.user.userId === user.userId) {
        return {
          EC: 0,
          EM: 'Bạn không thể báo cáo bình luận của chính mình',
        };
      }

      // Save report to database
      const report = this.reportRepo.create({
        comment: { commentId } as any,
        reporter: { userId: user.userId } as any,
        reason,
        description,
        status: 'PENDING',
      });
      await this.reportRepo.save(report);

      const targetRoles = ['SYSTEM_ADMIN', 'ROLE_MOD', 'ADMIN_CLIENT'];

      const adminReceivers = await this.userRepo.find({
        where: { role: { roleName: In(targetRoles) } },
        relations: ['role'],
      });

      if (adminReceivers.length === 0) {
        console.warn('No admin/mod accounts found to receive report notifications');
      }

      for (const admin of adminReceivers) {
        const notification = await this.notificationsService.createNotification({
          userId: admin.userId,
          type: 'report',
          message: `${user.fullName} đã báo cáo bình luận của ${comment.user.fullName} trong phim "${comment.film?.title || 'Unknown'}"`,
          replierId: user.userId,
          result: {
            commentId: comment.commentId,
            reporterId: user.userId,
            reporterName: user.fullName,
            reporterAvatar: user.avatarUrl,
            commentContent: comment.content,
            commentUserId: comment.user.userId,
            commentUserName: comment.user.fullName,
            filmId: comment.film?.filmId,
            filmTitle: comment.film?.title,
            filmSlug: comment.film?.slug,
            reason,
            description,
            reportId: report.reportId,
          },
        });

        // Gửi socket real-time cho đúng admin/mod
        this.commentGateway.sendReportNotificationToSpecificAdmin(admin.userId, {
          notificationId: notification.notificationId,
          reporter: {
            userId: user.userId,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
          },
          comment: {
            commentId: comment.commentId,
            content: comment.content,
            user: {
              userId: comment.user.userId,
              fullName: comment.user.fullName,
            },
          },
          film: comment.film
            ? {
                filmId: comment.film.filmId,
                title: comment.film.title,
                slug: comment.film.slug,
              }
            : null,
          reason,
          description,
          reportId: report.reportId,
          createdAt: new Date(),
        });
      }

      return {
        EC: 1,
        EM: 'Report submitted successfully',
      };
    } catch (error) {
      console.error('Error in reportComment:', error);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from reportComment service',
      });
    }
  }

  // Get all reports for admin
  async getReports(status?: string, page = 1, limit = 20) {
    try {
      const queryBuilder = this.reportRepo
        .createQueryBuilder('report')
        .withDeleted()
        .leftJoinAndSelect('report.comment', 'comment')
        .leftJoinAndSelect('comment.user', 'commentUser')
        .leftJoinAndSelect('comment.film', 'film')
        .leftJoinAndSelect('report.reporter', 'reporter')
        .leftJoinAndSelect('report.reviewedBy', 'reviewer')
        .orderBy('report.createdAt', 'DESC');

      if (status && status !== 'ALL') {
        queryBuilder.where('report.status = :status', { status });
      }

      const [reports, total] = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      // Count duplicates for each report
      const enriched = await Promise.all(
        reports.map(async (r) => {
          if (!r.comment) {
            return { ...r, duplicateCount: 0 };
          }
          const duplicates = await this.reportRepo.count({
            where: {
              comment: { commentId: r.comment.commentId },
              status: 'PENDING',
            },
          });
          return { ...r, duplicateCount: duplicates };
        }),
      );

      return {
        EC: 1,
        reports: enriched,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error in getReports:', error);
      throw new InternalServerErrorException('Error fetching reports');
    }
  }

  async dismissReport(reportId: string, adminId: number, note?: string) {
    try {
      const report = await this.reportRepo.findOne({
        where: { reportId },
        relations: ['reporter', 'comment', 'comment.film'], 
      });

      if (!report) {
        return { EC: 0, EM: 'Report not found' };
      }

      report.status = 'DISMISSED';
      report.reviewedBy = { userId: adminId } as any;
      report.reviewedAt = new Date();
      report.reviewNote = note;
      await this.reportRepo.save(report);

      // Notification to reporter
      await this.notificationsService.createNotification({
        userId: report.reporter.userId,
        type: 'report_result',
        message: 'Bình luận bạn báo cáo không vi phạm tiêu chuẩn cộng đồng.',
        result: {
          reportId,
          commentId: report.comment.commentId,
          action: 'DISMISSED',
          filmId: report.comment.film?.filmId,
          slug: report.comment.film?.slug,
          filmTitle: report.comment.film?.title,
        },
      });

      // Mark admin's notification as read
      await this.notificationsService.markAsReadByReportId(reportId, adminId);

      return { EC: 1, EM: 'Report dismissed successfully' };
    } catch (error) {
      console.error('Error in dismissReport:', error);
      throw new InternalServerErrorException('Error dismissing report');
    }
  }

  async hideFromReport(reportId: string, user: IUser, reason: string, note?: string) {
    try {
      const report = await this.reportRepo.findOne({
        where: { reportId },
        relations: ['reporter', 'comment', 'comment.user', 'comment.film'],
      });

      if (!report) {
        return { EC: 0, EM: 'Report not found' };
      }
      report.status = 'ACTIONED';
      report.reviewedBy = { userId: user.userId } as any;
      report.reviewedAt = new Date();
      report.reviewNote = note;
      await this.reportRepo.save(report);

      if (!report.comment.isHidden) {
        await this.toggleHideComment(report.comment.commentId, user);
      }

      await this.notificationsService.createNotification({
        userId: report.comment.user.userId,
        type: 'violation_warning',
        message: `Bình luận của bạn đã bị ẩn vì vi phạm: ${reason}`,
        result: {
          commentId: report.comment.commentId,
          reason,
          filmId: report.comment.film?.filmId,
          slug: report.comment.film?.slug,
          filmTitle: report.comment.film?.title,
        },
      });

      await this.notificationsService.createNotification({
        userId: report.reporter.userId,
        type: 'report_result',
        message: 'Cảm ơn bạn đã báo cáo. Chúng tôi đã xử lý vi phạm.',
        result: {
          reportId,
          action: 'HIDE',
          filmId: report.comment.film?.filmId,
          slug: report.comment.film?.slug,
          filmTitle: report.comment.film?.title,
        },
      });

      await this.notificationsService.markAsReadByReportId(reportId, user.userId);

      return { EC: 1, EM: 'Comment hidden and warnings sent' };
    } catch (error) {
      console.error('Error in hideFromReport:', error);
      throw new InternalServerErrorException('Error hiding comment from report');
    }
  }
}

async function loadChildrenRecursive(
  repo: Repository<Comment>,
  parentId: string,
): Promise<Comment[]> {
  const children = await repo.find({
    where: {
      parent: { commentId: parentId },
      isHidden: false,
      deletedAt: IsNull(),
    },
    relations: ['user', 'film', 'reactions', 'reactions.user', 'parent', 'parent.user'],
    order: { createdAt: 'ASC' },
  });
  for (const child of children) {
    child.children = await loadChildrenRecursive(repo, child.commentId);
  }
  return children;
}

function buildTree(comment: any, userId: string | number | null): any {
  const currentReaction = userId ? comment.reactions?.find((r) => r.user?.userId === userId) : null;
  return {
    id: comment.commentId,
    content: comment.content,
    createdAt: comment.createdAt,
    isHidden: comment.isHidden,
    totalLike: comment.totalLike,
    totalDislike: comment.totalDislike,
    totalChildrenComment: comment.totalChildrenComment,
    currentUserReaction: userId ? currentReaction?.type || null : undefined,
    user: {
      id: comment.user.userId,
      name: comment.user.fullName,
      avatar: comment.user.avatarUrl,
    },
    film: comment.film
      ? {
          filmId: comment.film.filmId,
          title: comment.film.title,
          slug: comment.film.slug,
        }
      : null,
    parent: comment.parent
      ? {
          id: comment.parent.commentId,
          user: {
            id: comment.parent.user?.userId,
            name: comment.parent.user?.fullName,
            avatar: comment.parent.user?.avatarUrl,
          },
        }
      : null,
    replies: (comment.children || [])
      .filter((child) => !child.isHidden)
      .map((child) => buildTree(child, userId)),
  };
}
