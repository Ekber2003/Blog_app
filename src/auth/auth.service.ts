import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from 'src/users/entities/user.etity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // Email ilə istifadəçini tap və parolu da gətir
    const user = await this.userService.findOne({
      where: { email: dto.email },
      select: {
        id: true,
        username: true,
        email: true,
        password: true, // ✅ Parolu da seç
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email və ya parol səhvdir');
    }

    // Parol yoxlanışı
    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Email və ya parol səhvdir');
    }

    return this.generateToken(user);
  }

  async register(dto: RegisterDto) {
    const user = await this.userService.create({
      ...dto,
      role: [Role.USER], // Default olaraq USER rolu
    });

    return this.generateToken(user);
  }

  private generateToken(user: any) {
    const payload = { 
      userId: user.id, 
      role: user.role,
      email: user.email, // ✅ Email də əlavə edək
    };
    
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      access_token: token, // ✅ Standart adlandırma
    };
  }
}