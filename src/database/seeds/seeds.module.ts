import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperAdminSeeder } from './super-admin.seed';
import { User } from 'src/users/entities/user.etity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [SuperAdminSeeder],
  exports: [SuperAdminSeeder],
})
export class SeedsModule implements OnModuleInit {
  constructor(private readonly superAdminSeeder: SuperAdminSeeder) {}

  async onModuleInit() {
    // ✅ Modul yüklənəndə avtomatik seed işləyir
    await this.superAdminSeeder.seed();
  }
}