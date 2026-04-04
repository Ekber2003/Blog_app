import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @IsString()
  @MinLength(1)
  @ApiProperty({ example: 'Yenilənmiş şərh mətni' })
  content: string;
}