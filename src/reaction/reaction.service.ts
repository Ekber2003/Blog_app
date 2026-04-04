import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reaction, ReactionType, ReactionTargetType } from './reaction.entity';
import { Post } from 'src/post/post.entity';
import { Comment } from 'src/comment/comment.entity';
import { CreateReactionDto } from './dto/create-reaction.dto';

@Injectable()
export class ReactionService {
  constructor(
    @InjectRepository(Reaction)
    private readonly reactionRepo: Repository<Reaction>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  async addOrUpdateReaction(userId: string, dto: CreateReactionDto) {
    // Target-in mövcudluğunu yoxla
    if (dto.targetType === ReactionTargetType.POST) {
      const post = await this.postRepo.findOne({ where: { id: dto.targetId } });
      if (!post) throw new NotFoundException('Post tapılmadı');
    } else {
      const comment = await this.commentRepo.findOne({ where: { id: dto.targetId } });
      if (!comment) throw new NotFoundException('Şərh tapılmadı');
    }

    // Mövcud reaction-u tap
    const existingReaction = await this.reactionRepo.findOne({
      where: {
        userId,
        targetType: dto.targetType,
        targetId: dto.targetId,
      },
    });

    if (existingReaction) {
      // Əgər eyni reaction-dursa, sil (toggle)
      if (existingReaction.type === dto.type) {
        await this.removeReaction(existingReaction);
        await this.updateCounts(dto.targetType, dto.targetId);
        return { message: 'Reaction silindi', removed: true };
      }

      // Əgər fərqli reaction-dursa, dəyiş
      const oldType = existingReaction.type;
      existingReaction.type = dto.type;
      await this.reactionRepo.save(existingReaction);
      await this.updateCounts(dto.targetType, dto.targetId);
      
      return { 
        message: `${oldType === ReactionType.LIKE ? 'Like' : 'Dislike'} ${dto.type === ReactionType.LIKE ? 'like-ə' : 'dislike-ə'} dəyişdirildi`,
        changed: true,
      };
    }

    // Yeni reaction yarat
    // const reaction = this.reactionRepo.create({
    //   userId,
    //   type: dto.type,
    //   targetType: dto.targetType,
    //   targetId: dto.targetId,
    //   postId: dto.targetType === ReactionTargetType.POST ? dto.targetId : null,
    //   commentId: dto.targetType === ReactionTargetType.COMMENT ? dto.targetId : null,
    // });
const reaction = this.reactionRepo.create({
  userId,
  type: dto.type,
  targetType: dto.targetType,
  targetId: dto.targetId,
  postId: dto.targetType === ReactionTargetType.POST ? dto.targetId : (null as any),
  commentId: dto.targetType === ReactionTargetType.COMMENT ? dto.targetId : (null as any),
});

    await this.reactionRepo.save(reaction);
    await this.updateCounts(dto.targetType, dto.targetId);

    return { 
      message: `${dto.type === ReactionType.LIKE ? 'Like' : 'Dislike'} əlavə edildi`,
      added: true,
    };
  }

  private async removeReaction(reaction: Reaction) {
    await this.reactionRepo.remove(reaction);
  }

  private async updateCounts(targetType: ReactionTargetType, targetId: string) {
    const likes = await this.reactionRepo.count({
      where: { targetType, targetId, type: ReactionType.LIKE },
    });

    const dislikes = await this.reactionRepo.count({
      where: { targetType, targetId, type: ReactionType.DISLIKE },
    });

    if (targetType === ReactionTargetType.POST) {
      await this.postRepo.update(targetId, {
        likeCount: likes,
        dislikeCount: dislikes,
      });
    } else {
      await this.commentRepo.update(targetId, {
        likeCount: likes,
        dislikeCount: dislikes,
      });
    }
  }

  // İstifadəçinin reaction-unu gətir
  async getUserReaction(userId: string, targetType: ReactionTargetType, targetId: string) {
    const reaction = await this.reactionRepo.findOne({
      where: { userId, targetType, targetId },
    });

    return reaction ? { type: reaction.type } : null;
  }

  // Post və ya comment üzrə bütün reaction-ları gətir
  async getReactions(targetType: ReactionTargetType, targetId: string) {
    const likes = await this.reactionRepo.count({
      where: { targetType, targetId, type: ReactionType.LIKE },
    });

    const dislikes = await this.reactionRepo.count({
      where: { targetType, targetId, type: ReactionType.DISLIKE },
    });

    return { likes, dislikes };
  }
}