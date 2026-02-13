import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @IsString()
  @MinLength(3, { message: 'İstifadəçi adı ən az 3 simvol olmalıdır' })
  @MaxLength(20, { message: 'İstifadəçi adı çox uzundur' })
  @ApiProperty({ example: 'nicat_99' })
  username: string;

  @IsEmail({}, { message: 'Zəhmət olmasa düzgün email daxil edin' })
  @ApiProperty({ example: 'istifadeci@mail.com' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Parol ən az 8 simvoldan ibarət olmalıdır' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Parol çox zəifdir (Böyük hərf, rəqəm və ya simvol olmalıdır)',
  })
  @ApiProperty({ example: 'StrongPass123!' })
  password: string;
}