import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'abc123-image.jpg' })
  filename: string;

  @ApiProperty({ example: 'my-photo.jpg' })
  originalName: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimetype: string;

  @ApiProperty({ example: 102400 })
  size: number;

  @ApiProperty({ example: 'http://localhost:3003/uploads/abc123-image.jpg' })
  url: string;

  @ApiProperty({ example: 'image' })
  type: string;
}