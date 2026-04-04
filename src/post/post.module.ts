import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // ✅ Import (əgər yoxdursa)
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post } from './post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    // ConfigModule artıq AppModule-də global olaraq import edilib
    // Amma əgər lazımdırsa burada da əlavə edə bilərsiniz
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}