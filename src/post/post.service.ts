import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config'; // ✅ Import
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
    private readonly configService: ConfigService, // ✅ Inject
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
    .orderBy('post.createdAt', 'DESC');

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
    // Ən etibarlı PostgreSQL massiv axtarış yolu
    queryBuilder.andWhere('post.tags @> ARRAY[:tag]::text[]', { tag });
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

// ✅ findOne - incrementView parametri ilə
async findOne(id: string, incrementView: boolean = false) {
  const post = await this.postRepo.findOne({
    where: { id },
    relations: ['author','comments']
  });

  if (!post) {
    throw new NotFoundException('Post tapılmadı');
  }

  // ✅ Yalnız increment true olarsa view count artsın
  if (incrementView) {
    post.viewCount += 1;
    await this.postRepo.save(post);
  }

  return post;
}

// ✅ Yeni metod - yalnız view count artırmaq üçün
async incrementView(id: string) {
  const post = await this.postRepo.findOne({ where: { id } });
  
  if (!post) {
    throw new NotFoundException('Post tapılmadı');
  }

  post.viewCount += 1;
  await this.postRepo.save(post);

  return { viewCount: post.viewCount };
}

  async findMyPosts(userId: string) {
    return this.postRepo.find({
      where: { authorId: userId },
      order: { createdAt: 'DESC' },
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

  // ✅ Şəkillə birlikdə post yarat
  async createWithImage(
    userId: string,
    body: any,
    file?: Express.Multer.File,
  ) {
    const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3003';
    
    // Tags string-dən array-ə çevir
let tags = [];
if (body.tags) {
  if (Array.isArray(body.tags)) {
    tags = body.tags;
  } else if (typeof body.tags === 'string') {
    tags = body.tags.split(',').map((tag: string) => tag.trim()).filter(t => t);
  }
}

    const postData: any = {
      title: body.title,
      content: body.content,
      excerpt: body.excerpt || null,
      status: body.status || PostStatus.DRAFT,
      tags,
      authorId: userId,
      publishedAt: body.status === PostStatus.PUBLISHED ? new Date() : null,
    };

    // Əgər fayl yüklənibsə, URL əlavə et
    if (file) {
      postData.featuredImage = `${baseUrl}/uploads/${file.filename}`;
    }

    const post = this.postRepo.create(postData);
    return this.postRepo.save(post);
  }

  // ✅ Post şəklini yenilə
  async updateImage(
    id: string,
    userId: string,
    userRole: Role[],
    file: Express.Multer.File,
  ) {
    const post = await this.postRepo.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post tapılmadı');
    }

    const isAuthor = post.authorId === userId;
    const isAdmin = userRole.includes(Role.ADMIN) || userRole.includes(Role.SUPER_ADMIN);

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('Bu postu redaktə etmək icazəniz yoxdur');
    }

    const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3003';
    post.featuredImage = `${baseUrl}/uploads/${file.filename}`;

    return this.postRepo.save(post);
  }
  async getPopularTags(limit: number = 7): Promise<string[]> {
  const posts = await this.postRepo
    .createQueryBuilder('post')
    .select('post.tags')
    .where('post.status = :status', { status: PostStatus.PUBLISHED })
    .andWhere('post.tags IS NOT NULL')
    .getMany();

  const tagFrequency: Record<string, number> = {};
  posts.forEach((post) =>
    post.tags?.forEach((tag) => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    })
  );

  return Object.entries(tagFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}
}