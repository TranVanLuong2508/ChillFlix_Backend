import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import type { IUser } from '../users/interface/user.interface';
import { ResponseMessage, User } from 'src/decorators/customize';
import { PaginationDto } from './dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('create-comment')
  @ResponseMessage('Create a new comment')
  createComment(@Body() createCommentDto: CreateCommentDto, @User() user: IUser) {
    return this.commentService.createComment(createCommentDto, user);
  }

  @Get('get-comments-by-film/:filmId')
  @ResponseMessage('Get comments by film ID')
  getCommentsByFilm(@Param('filmId') filmId: string, @Query() query: PaginationDto) {
    return this.commentService.findCommentsByFilm(query, filmId);
  }

  @Get('get-comment/:commentId')
  @ResponseMessage('Get comment by ID')
  getComment(@Param('commentId') commentId: string) {
    return this.commentService.getComment(commentId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('update-comment/:commentId')
  @ResponseMessage('Update comment by ID')
  updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @User() user: IUser,
  ) {
    return this.commentService.updateComment(commentId, updateCommentDto, user);
  }

  @Delete('delete-comment/:commentId')
  @ResponseMessage('Remove comment by ID')
  deleteComment(@Param('commentId') commentId: string, @User() user: IUser) {
    return this.commentService.deleteComment(commentId, user);
  }
}
