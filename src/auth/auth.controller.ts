import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
@ApiTags('Auth') // ✅ Swagger-də Auth bölməsi
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'İstifadəçi girişi' })
  @ApiResponse({ status: 200, description: 'Uğurlu giriş' })
  @ApiResponse({ status: 401, description: 'Email və ya parol səhvdir' })
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('register')
  @ApiOperation({ summary: 'Yeni istifadəçi qeydiyyatı' })
  @ApiResponse({ status: 201, description: 'İstifadəçi yaradıldı' })
  @ApiResponse({ status: 400, description: 'Email artıq mövcuddur' })
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }
}