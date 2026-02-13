import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgetPasswordDto {
  @IsEmail({}, { message: 'Zəhmət olmasa düzgün email daxil edin' })
  @ApiProperty({ 
    description: 'Bərpa linki göndəriləcək email ünvanı',
    example: 'istifadeci@mail.com' 
  })
  email: string;
}