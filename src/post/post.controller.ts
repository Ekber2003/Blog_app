import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from 'src/auth/decorators/user.decorators';
import { Role } from 'src/users/entities/user.etity';
import { diskStorage } from 'multer';
import { extname } from 'path';

const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `${uniqueSuffix}${ext}`);
  },
});

@Controller('posts')
@ApiTags('Posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // ✅ Bütün SABIT route-lar əvvəldə olmalıdır - dinamik :id-dən ƏVVƏL

  @Get('popular-tags')
@ApiOperation({ summary: 'Ən populyar tagları gətir' })
getPopularTags(@Query('limit') limit?: number) {
  return this.postService.getPopularTags(limit || 7);
}

  @Get()
  @ApiOperation({ summary: 'Bütün postları gətir' })
  findAll(@Query() query: QueryPostDto) {
    return this.postService.findAll(query);
  }

  // ✅ "my/posts" - :id-dən əvvəl
  @Get('my/posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Öz postlarımı gətir' })
  findMyPosts(@User() user) {
    return this.postService.findMyPosts(user.userId);
  }

  // ✅ "with-image" - :id-dən əvvəl
  @Post('with-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileInterceptor('featuredImage', {
      storage,
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new Error('Yalnız şəkil faylları!'), false);
        }
        callback(null, true);
      },
    }),
  )
  @ApiOperation({ summary: 'Şəkillə birlikdə post yarat' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        excerpt: { type: 'string' },
        status: { type: 'string', enum: ['draft', 'published', 'archived'] },
        tags: { type: 'string', description: 'Vergüllə ayrılmış' },
        featuredImage: { type: 'string', format: 'binary' },
      },
      required: ['title', 'content'],
    },
  })
  createWithImage(
    @User() user,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.postService.createWithImage(user.userId, body, file);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Yeni post yarat' })
  create(@User() user, @Body() dto: CreatePostDto) {
    return this.postService.create(user.userId, dto);
  }

  // ✅ Dinamik :id route-ları ən sonda
  @Get(':id')
  @ApiOperation({ summary: 'Post ID ilə gətir' })
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id, false);
  }

  @Patch(':id/view')
  @ApiOperation({ summary: 'Post baxış sayını artır' })
  incrementView(@Param('id') id: string) {
    return this.postService.incrementView(id);
  }

  @Patch(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileInterceptor('featuredImage', {
      storage,
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new Error('Yalnız şəkil faylları!'), false);
        }
        callback(null, true);
      },
    }),
  )
  @ApiOperation({ summary: 'Post şəklini yenilə' })
  @ApiConsumes('multipart/form-data')
  updateImage(
    @Param('id') id: string,
    @User() user,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.postService.updateImage(id, user.userId, user.role, file);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Postu publish et' })
  publish(@Param('id') id: string, @User() user) {
    return this.postService.publish(id, user.userId, user.role);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Postu yenilə' })
  update(@Param('id') id: string, @User() user, @Body() dto: UpdatePostDto) {
    return this.postService.update(id, user.userId, user.role, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Postu sil' })
  delete(@Param('id') id: string, @User() user) {
    return this.postService.delete(id, user.userId, user.role);
  }
}