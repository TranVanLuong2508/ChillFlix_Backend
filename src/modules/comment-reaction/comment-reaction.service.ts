import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentReaction } from './entities/comment-reaction.entity';
import { CreateCommentReactionDto } from './dto/create-comment-reaction.dto';
import { IUser } from '../users/interface/user.interface';
import { Comment } from '../comment/entities/comment.entity';

@Injectable()
export class CommentReactionService {
  constructor(
    @InjectRepository(CommentReaction)
    private readonly reactionRepo: Repository<CommentReaction>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  async reactToComment(dto: CreateCommentReactionDto, user: IUser) {
    try {
      const existing = await this.reactionRepo.findOne({
        where: { user: { userId: user.userId }, comment: { commentId: dto.commentId } },
        relations: ['comment'],
      });

      if (!existing) {
        const newReaction = this.reactionRepo.create({
          user: { userId: user.userId } as any,
          comment: { commentId: dto.commentId } as any,
          type: dto.type,
        });
        await this.reactionRepo.save(newReaction);

        if (dto.type === 'LIKE') await this.commentRepo.increment({ commentId: dto.commentId }, 'totalLike', 1);
        else await this.commentRepo.increment({ commentId: dto.commentId }, 'totalDislike', 1);

        return { EC: 1, EM: 'Reacted successfully', data: newReaction };
      }

      if (existing.type === dto.type) {
        await this.reactionRepo.remove(existing);
        if (dto.type === 'LIKE') await this.commentRepo.decrement({ commentId: dto.commentId }, 'totalLike', 1);
        else await this.commentRepo.decrement({ commentId: dto.commentId }, 'totalDislike', 1);

        return { EC: 1, EM: 'Reaction removed' };
      }

      existing.type = dto.type;
      await this.reactionRepo.save(existing);
      if (dto.type === 'LIKE') {
        await this.commentRepo.increment({ commentId: dto.commentId }, 'totalLike', 1);
        await this.commentRepo.decrement({ commentId: dto.commentId }, 'totalDislike', 1);
      } else {
        await this.commentRepo.increment({ commentId: dto.commentId }, 'totalDislike', 1);
        await this.commentRepo.decrement({ commentId: dto.commentId }, 'totalLike', 1);
      }

      return { EC: 1, EM: 'Reaction updated', data: existing };
    } catch (error) {
      console.error('Error in reactToComment:', error);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from reactToComment service',
      });
    }
  }
}
