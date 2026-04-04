import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentDto } from './dto/query-comment.dto';
import { Role } from 'src/users/entities/user.etity';
import { PostService } from 'src/post/post.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    private readonly postService: PostService,
  ) {}

  // Şərh yaratmaq
  async create(userId: string, dto: CreateCommentDto) {
    // Post mövcudluğunu yoxla
    await this.postService.findOne(dto.postId);

    // Əgər parent comment varsa, yoxla
    if (dto.parentId) {
      const parentComment = await this.commentRepo.findOne({
        where: { id: dto.parentId },
      });

      if (!parentComment) {
        throw new BadRequestException('Parent comment tapılmadı');
      }

      if (parentComment.postId !== dto.postId) {
        throw new BadRequestException('Parent comment başqa posta aiddir');
      }
    }

    const comment = this.commentRepo.create({
      ...dto,
      userId,
    });

    return this.commentRepo.save(comment);
  }

  // Bütün şərhləri gətir (filtrlə)
  async findAll(query: QueryCommentDto) {
    const { postId, page = 1, limit = 20 } = query;

    const queryBuilder = this.commentRepo
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('comment.parent', 'parent')
      .orderBy('comment.createdAt', 'DESC');

    if (postId) {
      queryBuilder.andWhere('comment.postId = :postId', { postId });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [comments, total] = await queryBuilder.getManyAndCount();

    return {
      data: comments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Bir şərhi gətir
  async findOne(id: string) {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: ['user', 'post', 'parent', 'replies'],
    });

    if (!comment) {
      throw new NotFoundException('Şərh tapılmadı');
    }

    return comment;
  }

  // Post üzrə şərhləri gətir (nested structure)
  async findByPost(postId: string) {
    const comments = await this.commentRepo.find({
      where: { postId, parentId: IsNull() },
      relations: ['user', 'replies', 'replies.user'],
      order: { createdAt: 'DESC' },
    });

    return comments;
  }

  // İstifadəçinin öz şərhlərini gətir
  async findMyComments(userId: string) {
    return this.commentRepo.find({
      where: { userId },
      relations: ['post'],
      order: { createdAt: 'DESC' },
    });
  }

  // Şərhi yeniləmək (yalnız sahib)
  async update(id: string, userId: string, userRole: Role[], dto: UpdateCommentDto) {
    const comment = await this.commentRepo.findOne({ where: { id } });

    if (!comment) {
      throw new NotFoundException('Şərh tapılmadı');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('Yalnız öz şərhinizi redaktə edə bilərsiniz');
    }

    comment.content = dto.content;
    comment.isEdited = true;

    return this.commentRepo.save(comment);
  }

  // Şərhi silmək (sahib, admin, super_admin)
async delete(id: string, userId: string, userRole: string[]) {
  const comment = await this.commentRepo.findOne({ 
    where: { id },
    relations: ['replies'] // ✅ Replies ilə birlikdə gətir
  });

  if (!comment) {
    throw new NotFoundException('Şərh tapılmadı');
  }

  // Yalnız öz şərhini və ya Admin+ silə bilər
  const isOwner = comment.userId === userId;
  const isAdmin = userRole.includes('admin') || userRole.includes('super_admin');

  if (!isOwner && !isAdmin) {
    throw new ForbiddenException('Bu şərhi silmək icazəniz yoxdur');
  }

  // ✅ CASCADE olduğu üçün replies avtomatik silinəcək
  await this.commentRepo.remove(comment);

  return { 
    message: 'Şərh silindi',
    deletedReplies: comment.replies?.length || 0 // Neçə reply silindi
  };
}

  // Post üzrə şərh sayını gətir
  async countByPost(postId: string): Promise<number> {
    return this.commentRepo.count({ where: { postId } });
  }
}