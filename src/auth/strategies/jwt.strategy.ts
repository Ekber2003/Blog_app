import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Token-dən istifadəçini tap
    const user = await this.usersService.findOne({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new UnauthorizedException('İstifadəçi tapılmadı');
    }

    // ✅ req.user = { userId, role, email }
    return { 
      userId: user.id, 
      role: user.role,
      email: user.email,
    };
  }
}