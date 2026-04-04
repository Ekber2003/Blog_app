import { IsString, IsOptional, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @ApiProperty({ example: 'Çox faydalı məqalə oldu, təşəkkürlər!' })
  content: string;

  @IsUUID()
  @ApiProperty({ example: 'uuid-of-post' })
  postId: string;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({ 
    example: 'uuid-of-parent-comment',
    description: 'Cavab yazmaq üçün parent comment ID' 
  })
  parentId?: string;
}