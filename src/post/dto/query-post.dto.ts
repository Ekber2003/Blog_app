import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PostStatus } from '../post.entity';

export class QueryPostDto {
  @IsOptional()
  @IsEnum(PostStatus)
  @ApiPropertyOptional({ enum: PostStatus })
  status?: PostStatus;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'nestjs' })
  search?: string; // Başlıq və ya contentdə axtarış

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'typescript' })
  tag?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ example: 1, default: 1 })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ example: 10, default: 10 })
  limit?: number = 10;
}