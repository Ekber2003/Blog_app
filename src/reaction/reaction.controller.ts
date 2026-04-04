import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReactionService } from './reaction.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorators';
import { ReactionTargetType } from './reaction.entity';

@Controller('reactions')
@ApiTags('Reactions')
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Like və ya Dislike əlavə et/dəyiş/sil' })
  addOrUpdateReaction(@User() user, @Body() dto: CreateReactionDto) {
    return this.reactionService.addOrUpdateReaction(user.userId, dto);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'İstifadəçinin reaction-unu yoxla' })
  getUserReaction(
    @User() user,
    @Query('targetType') targetType: ReactionTargetType,
    @Query('targetId') targetId: string,
  ) {
    return this.reactionService.getUserReaction(user.userId, targetType, targetId);
  }

  @Get(':targetType/:targetId')
  @ApiOperation({ summary: 'Reaction statistikası' })
  getReactions(
    @Param('targetType') targetType: ReactionTargetType,
    @Param('targetId') targetId: string,
  ) {
    return this.reactionService.getReactions(targetType, targetId);
  }
}