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
    // ✅ userService.findByEmail istifadə edin
    const user = await this.userService.findByEmail(dto.email);
    
    if (!user) {
      throw new UnauthorizedException('Email və ya parol səhvdir');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email və ya parol səhvdir');
    }

    const payload = { 
      userId: user.id, 
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const { password, ...result } = user;

    // ✅ Tarixləri ISO string formatında göndər
    return {
      user: {
        ...result,
        createdAt: result.createdAt ? result.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: result.updatedAt ? result.updatedAt.toISOString() : new Date().toISOString(),
      },
      access_token: this.jwtService.sign(payload),
    };
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
      username: user.username,
      role: user.role,
      email: user.email,
    };
    
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt ? user.createdAt : new Date().toISOString(),
        updatedAt: user.updatedAt ? user.updatedAt : new Date().toISOString(),
      },
      access_token: token,
    };
  }
}