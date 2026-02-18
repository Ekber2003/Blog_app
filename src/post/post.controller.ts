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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from 'src/auth/decorators/user.decorators';
import { Role } from 'src/users/entities/user.etity';

@Controller('posts')
@ApiTags('Posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // Bütün postlar (hamı görə bilər)
  @Get()
  @ApiOperation({ summary: 'Bütün postları gətir (filtr və axtarışla)' })
  findAll(@Query() query: QueryPostDto) {
    return this.postService.findAll(query);
  }

  // Bir post (hamı görə bilər)
  @Get(':id')
  @ApiOperation({ summary: 'Post ID ilə gətir' })
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  // Öz postlarımı gör
  @Get('my/posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Öz postlarımı gətir' })
  findMyPosts(@User() user) {
    return this.postService.findMyPosts(user.userId);
  }

  // Post yarat (Author, Admin, Super Admin)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Yeni post yarat (Author+)' })
  @ApiResponse({ status: 201, description: 'Post yaradıldı' })
  create(@User() user, @Body() dto: CreatePostDto) {
    return this.postService.create(user.userId, dto);
  }

  // Post yenilə
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Postu yenilə (müəllif və ya admin)' })
  update(@Param('id') id: string, @User() user, @Body() dto: UpdatePostDto) {
    return this.postService.update(id, user.userId, user.role, dto);
  }

  // Post publish et
  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Postu publish et' })
  publish(@Param('id') id: string, @User() user) {
    return this.postService.publish(id, user.userId, user.role);
  }

  // Post sil
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Postu sil (müəllif və ya admin)' })
  delete(@Param('id') id: string, @User() user) {
    return this.postService.delete(id, user.userId, user.role);
  }
}