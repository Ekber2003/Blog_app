import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { Role } from "src/users/entities/user.etity";
import * as bcrypt from 'bcryptjs'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // 1. İstifadəçini yalnız email-ə görə tapırıq
    const user = await this.userService.findOne({
      // Sənin LoginDto-da username yoxdur, ona görə birbaşa email-lə axtarırıq
      where: { email: dto.email }, 
      select: ['id', 'password', 'username', 'email', 'role'], 
    });

    if (!user) {
      throw new UnauthorizedException('Email və ya parol səhvdir');
    }

    // 2. Parol yoxlanışı
    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Email və ya parol səhvdir');
    }

    return this.generateToken(user);
  }

  async register(dto: RegisterDto) {
    const user = await this.userService.create({
      ...dto,
      role: [Role.USER],
    });

    return this.generateToken(user);
  }

  private async generateToken(user: any) {
    const payload = { userId: user.id, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }
}