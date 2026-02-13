import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('register') // ✅ /auth/register
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }
}

//   @Post('forget-password')
//   async forgetPassword(@Body() body: ForgetPasswordDto) {
//   return { message: 'Bərpa linki emailinizə göndərildi' };
// }