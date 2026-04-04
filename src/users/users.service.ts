import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from './entities/user.etity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async findAll() {
    const users = await this.userRepo.find({
      order: { createdAt: 'DESC' },
    });
    return users.map(({ password, ...user }) => user);
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('İstifadəçi tapılmadı');
    }
    const { password, ...result } = user;
    return result;
  }

// users.service.ts
async findByEmail(email: string) {
  return this.userRepo.findOne({ 
    where: { email },
    select: ['id', 'username', 'email', 'password', 'role', 'avatar', 'bio', 'createdAt', 'updatedAt'],
  });
}

  // ✅ Öz profilini yenilə
  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('İstifadəçi tapılmadı');
    }

    const allowedUpdates: any = {};

    if (dto.username && dto.username !== user.username) {
      const existingUsername = await this.userRepo.findOne({
        where: { username: dto.username },
      });
      if (existingUsername) {
        throw new ConflictException('Bu istifadəçi adı artıq mövcuddur');
      }
      allowedUpdates.username = dto.username;
    }

    if (dto.email && dto.email !== user.email) {
      const existingEmail = await this.userRepo.findOne({
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new ConflictException('Bu email artıq mövcuddur');
      }
      allowedUpdates.email = dto.email;
    }

    if (dto.bio !== undefined) {
      allowedUpdates.bio = dto.bio;
    }

    if (dto.password) {
      allowedUpdates.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(user, allowedUpdates);
    const updatedUser = await this.userRepo.save(user);
    const { password, ...result } = updatedUser;
    return result;
  }

  async create(dto: CreateUserDto) {
    if (dto.role.length !== 1) {
      throw new BadRequestException('Yalnız bir rol seçə bilərsiniz');
    }

    if (dto.role.includes(Role.SUPER_ADMIN)) {
      throw new ForbiddenException('Super Admin rolu verilə bilməz');
    }

    const existingUsername = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (existingUsername) {
      throw new ConflictException('Bu istifadəçi adı artıq mövcuddur');
    }

    const existingEmail = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Bu email artıq mövcuddur');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      ...dto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepo.save(user);
    const { password, ...result } = savedUser;
    return result;
  }

  // ✅ Admin üçün başqa istifadəçini yenilə
  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('İstifadəçi tapılmadı');
    }

    if (user.role.includes(Role.SUPER_ADMIN)) {
      throw new ForbiddenException('Super Admin redaktə edilə bilməz');
    }

    if (dto.role && dto.role.includes(Role.SUPER_ADMIN)) {
      throw new ForbiddenException('Super Admin rolu verilə bilməz');
    }

    if (dto.role && dto.role.length !== 1) {
      throw new BadRequestException('Yalnız bir rol seçə bilərsiniz');
    }

    if (dto.username && dto.username !== user.username) {
      const existingUsername = await this.userRepo.findOne({
        where: { username: dto.username },
      });
      if (existingUsername) {
        throw new ConflictException('Bu istifadəçi adı artıq mövcuddur');
      }
    }

    if (dto.email && dto.email !== user.email) {
      const existingEmail = await this.userRepo.findOne({
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new ConflictException('Bu email artıq mövcuddur');
      }
    }

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(user, dto);
    const updatedUser = await this.userRepo.save(user);
    const { password, ...result } = updatedUser;
    return result;
  }

  // ✅ İstifadəçini sil
  async remove(id: string, currentUserId: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('İstifadəçi tapılmadı');
    }

    if (user.role.includes(Role.SUPER_ADMIN)) {
      throw new ForbiddenException('Super Admin silinə bilməz');
    }

    if (id === currentUserId) {
      throw new BadRequestException('Öz hesabınızı silə bilməzsiniz');
    }

    await this.userRepo.remove(user);
    return { message: 'İstifadəçi uğurla silindi' };
  }

  // ✅ Avatar yüklə
  async updateAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('İstifadəçi tapılmadı');
    }

    if (user.avatar) {
      const oldAvatarPath = path.join(process.cwd(), 'uploads', 'avatars', path.basename(user.avatar));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3003';
    user.avatar = `${baseUrl}/uploads/avatars/${file.filename}`;

    await this.userRepo.save(user);
    const { password, ...result } = user;
    return result;
  }

  // ✅ Avatar sil
  async removeAvatar(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('İstifadəçi tapılmadı');
    }

    if (user.avatar) {
      const avatarPath = path.join(process.cwd(), 'uploads', 'avatars', path.basename(user.avatar));
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    user.avatar = undefined;
    await this.userRepo.save(user);

    const { password, ...result } = user;
    return result;
  }
}