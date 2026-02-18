import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from 'src/users/entities/user.etity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SuperAdminSeeder {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async seed() {
    try {
      const existing = await this.userRepo.findOne({
        where: { email: 'superadmin@blog.com' },
      });

      if (existing) {
        console.log('✅ Super Admin artıq mövcuddur');
        return;
      }

      const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10);

      const superAdmin = this.userRepo.create({
        username: 'superadmin',
        email: 'superadmin@blog.com',
        password: hashedPassword,
        role: [Role.SUPER_ADMIN],
      });

      await this.userRepo.save(superAdmin);
      
      console.log('✅ Super Admin uğurla yaradıldı!');
      console.log('📧 Email: superadmin@blog.com');
      console.log('🔑 Password: SuperAdmin123!');
    } catch (error) {
      console.error('❌ Super Admin yaradılarkən xəta:', error.message);
    }
  }
}