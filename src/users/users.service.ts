import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { User } from './entities/user.etity';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(data: CreateUserDto) {
    const existing = await this.userRepo.findOne({
      where: { email: data.email },
    });

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const hashed = await bcrypt.hash(data.password, 10);

    const user = this.userRepo.create({
      ...data,
      password: hashed,
    });

    return this.userRepo.save(user);
  }

  async findOne(options: FindOneOptions<User>) {
    const user = await this.userRepo.findOne(options);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll() {
    return this.userRepo.find();
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.findOne({ where: { id } });

    if (data.email && data.email !== user.email) {
      const existing = await this.userRepo.findOne({
        where: { email: data.email },
      });
      if (existing) {
        throw new BadRequestException('Email already exists');
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    Object.assign(user, data);
    return this.userRepo.save(user);
  }

  async delete(id: string) {
    const user = await this.findOne({ where: { id } });
    await this.userRepo.remove(user);
    return { message: 'User deleted successfully' };
  }
}