import { IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReactionType, ReactionTargetType } from '../reaction.entity';

export class CreateReactionDto {
  @IsEnum(ReactionType)
  @ApiProperty({ enum: ReactionType, example: ReactionType.LIKE })
  type: ReactionType;

  @IsEnum(ReactionTargetType)
  @ApiProperty({ enum: ReactionTargetType, example: ReactionTargetType.POST })
  targetType: ReactionTargetType;

  @IsUUID()
  @ApiProperty({ example: 'uuid-of-post-or-comment' })
  targetId: string;
}