import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail({}, { message: 'Düzgün email daxil edin' })
  @ApiProperty({ example: 'test@example.com' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Parol ən az 6 simvoldan ibarət olmalıdır' })
  @ApiProperty({ example: 'strongPassword123' })
  password: string;
}