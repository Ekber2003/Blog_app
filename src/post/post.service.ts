import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostStatus } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { Role } from 'src/users/entities/user.etity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  async create(userId: string, dto: CreatePostDto) {
    const post = this.postRepo.create({
      ...dto,
      authorId: userId,
      publishedAt: dto.status === PostStatus.PUBLISHED ? new Date() : null,
    });
    return this.postRepo.save(post);
  }

  async findAll(query: QueryPostDto) {
    const { status, search, tag, page = 1, limit = 10 } = query;

    const queryBuilder = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .orderBy('post.created_at', 'DESC'); // ✅ düzəldildi

    if (status) {
      queryBuilder.andWhere('post.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(post.title ILIKE :search OR post.content ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (tag) {
      queryBuilder.andWhere(':tag = ANY(post.tags)', { tag });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [posts, total] = await queryBuilder.getManyAndCount();

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['author', 'comments'],
    });

    if (!post) {
      throw new NotFoundException('Post tapılmadı');
    }

    post.viewCount += 1;
    await this.postRepo.save(post);

    return post;
  }

  async findMyPosts(userId: string) {
    return this.postRepo.find({
      where: { authorId: userId },
      order: { created_at: 'DESC' }, // ✅ artıq düzgündür
    });
  }

  async update(id: string, userId: string, userRole: Role[], dto: UpdatePostDto) {
    const post = await this.postRepo.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post tapılmadı');
    }

    const isAuthor = post.authorId === userId;
    const isAdmin =
      userRole.includes(Role.ADMIN) || userRole.includes(Role.SUPER_ADMIN);

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('Bu postu redaktə etmək icazəniz yoxdur');
    }

    if (
      dto.status === PostStatus.PUBLISHED &&
      post.status !== PostStatus.PUBLISHED
    ) {
      post.publishedAt = new Date();
    }

    Object.assign(post, dto);
    return this.postRepo.save(post);
  }

  async delete(id: string, userId: string, userRole: Role[]) {
    const post = await this.postRepo.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post tapılmadı');
    }

    const isAuthor = post.authorId === userId;
    const isAdmin =
      userRole.includes(Role.ADMIN) || userRole.includes(Role.SUPER_ADMIN);

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('Bu postu silmək icazəniz yoxdur');
    }

    await this.postRepo.remove(post);
    return { message: 'Post uğurla silindi' };
  }

  async publish(id: string, userId: string, userRole: Role[]) {
    const post = await this.postRepo.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post tapılmadı');
    }

    const isAuthor = post.authorId === userId;
    const isAdmin =
      userRole.includes(Role.ADMIN) || userRole.includes(Role.SUPER_ADMIN);

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('İcazəniz yoxdur');
    }

    post.status = PostStatus.PUBLISHED;
    post.publishedAt = new Date();

    return this.postRepo.save(post);
  }
}