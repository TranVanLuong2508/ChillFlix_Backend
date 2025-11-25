import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CommentReactionService } from './comment-reaction.service';
import { CreateCommentReactionDto } from './dto/create-comment-reaction.dto';
import { SkipCheckPermission, User } from 'src/decorators/customize';
import type { IUser } from '../users/interface/user.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('comment-reactions')
@UseGuards(AuthGuard('jwt'))
export class CommentReactionController {
  constructor(private readonly reactionService: CommentReactionService) {}

  @SkipCheckPermission()
  @Post('create-reaction')
  async react(@Body() dto: CreateCommentReactionDto, @User() user: IUser) {
    return this.reactionService.reactToComment(dto, user);
  }
}
