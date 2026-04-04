import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './comment.entity';
import { PostModule } from 'src/post/post.module'; // ✅ Post yoxlaması üçün

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    PostModule, // ✅
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}