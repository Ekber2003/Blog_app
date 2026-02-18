import { IsString, IsEnum, IsOptional, IsArray, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostStatus } from '../post.entity';

export class CreatePostDto {
  @IsString()
  @MinLength(3)
  @ApiProperty({ example: 'NestJS ilə Blog yaratmaq' })
  title: string;

  @IsString()
  @MinLength(10)
  @ApiProperty({ example: 'Bu məqalədə NestJS ilə necə blog yaratmağı öyrənəcəksiniz...' })
  content: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'NestJS bloq tutorialı' })
  excerpt?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  featuredImage?: string;

  @IsEnum(PostStatus)
  @IsOptional()
  @ApiPropertyOptional({ enum: PostStatus, default: PostStatus.DRAFT })
  status?: PostStatus;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiPropertyOptional({ example: ['nestjs', 'typescript', 'backend'] })
  tags?: string[];
}