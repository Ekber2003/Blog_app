import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // ✅ findOne yalnız id (string) qəbul edir
    const user = await this.usersService.findOne(payload.userId);

    if (!user) {
      throw new UnauthorizedException('İstifadəçi tapılmadı');
    }

    return { 
      userId: user.id, 
      username: user.username, 
      email: user.email,
      role: user.role 
    };
  }
}