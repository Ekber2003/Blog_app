import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '../entities/user.etity';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @MinLength(4)
  @ApiProperty({ example: 'johndoe' })
  username: string;

  @IsEmail()
  @ApiProperty({ example: 'test@example.com' })
  email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ example: 'strongPassword123' })
  password: string;

  @IsEnum(Role, { each: true })
  @ApiProperty({ enum: Role, isArray: true, example: [Role.USER] })
  role: Role[];
}