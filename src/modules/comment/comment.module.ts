import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Film } from 'src/modules/films/entities/film.entity';
import { Part } from 'src/modules/parts/entities/part.entity';
import { Episode } from 'src/modules/episodes/entities/episode.entity';

@Module({
  controllers: [CommentController],
  imports: [TypeOrmModule.forFeature([Comment, User, Film, Part, Episode])],
  providers: [CommentService],
  exports: [CommentModule],
})
export class CommentModule {}
