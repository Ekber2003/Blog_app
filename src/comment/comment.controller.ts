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
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentDto } from './dto/query-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorators';

@Controller('comments')
@ApiTags('Comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // Bütün şərhləri gətir (filtr ilə)
  @Get()
  @ApiOperation({ summary: 'Bütün şərhləri gətir (filtr ilə)' })
  findAll(@Query() query: QueryCommentDto) {
    return this.commentService.findAll(query);
  }

  // Post üzrə şərhləri gətir (nested)
  @Get('post/:postId')
  @ApiOperation({ summary: 'Post üzrə şərhləri gətir (nested replies ilə)' })
  findByPost(@Param('postId') postId: string) {
    return this.commentService.findByPost(postId);
  }

  // Post üzrə şərh sayı
  @Get('post/:postId/count')
  @ApiOperation({ summary: 'Post üzrə şərh sayı' })
  async countByPost(@Param('postId') postId: string) {
    const count = await this.commentService.countByPost(postId);
    return { count };
  }

  // Öz şərhlərimi gör
  @Get('my/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Öz şərhlərimi gətir' })
  findMyComments(@User() user) {
    return this.commentService.findMyComments(user.userId);
  }

  // Bir şərhi gətir
  @Get(':id')
  @ApiOperation({ summary: 'Şərh ID ilə gətir' })
  findOne(@Param('id') id: string) {
    return this.commentService.findOne(id);
  }

  // Şərh yarat (Login olmuş istifadəçilər)
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Yeni şərh yarat' })
  @ApiResponse({ status: 201, description: 'Şərh yaradıldı' })
  create(@User() user, @Body() dto: CreateCommentDto) {
    return this.commentService.create(user.userId, dto);
  }

  // Şərhi yenilə (yalnız şərh sahibi)
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Şərhi yenilə (yalnız sahib)' })
  update(@Param('id') id: string, @User() user, @Body() dto: UpdateCommentDto) {
    return this.commentService.update(id, user.userId, user.role, dto);
  }

  // Şərhi sil (sahib, admin, super_admin)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Şərhi sil (sahib, admin, super_admin)' })
  delete(@Param('id') id: string, @User() user) {
    return this.commentService.delete(id, user.userId, user.role);
  }
}