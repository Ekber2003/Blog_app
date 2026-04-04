import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload, FileType } from './upload.entity';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Upload)
    private readonly uploadRepo: Repository<Upload>,
    private readonly configService: ConfigService,
  ) {}

  // Fayl tipini təyin et
  private getFileType(mimetype: string): FileType {
    if (mimetype.startsWith('image/')) return FileType.IMAGE;
    if (mimetype.startsWith('video/')) return FileType.VIDEO;
    if (
      mimetype.includes('pdf') ||
      mimetype.includes('document') ||
      mimetype.includes('word') ||
      mimetype.includes('excel')
    ) {
      return FileType.DOCUMENT;
    }
    return FileType.OTHER;
  }

  // Fayl yüklə
  async uploadFile(file: Express.Multer.File, userId?: string) {
    if (!file) {
      throw new BadRequestException('Fayl seçilməyib');
    }

    const baseUrl =
      this.configService.get<string>('BASE_URL') || 'http://localhost:3003';
    const url = `${baseUrl}/uploads/${file.filename}`;

    const upload = this.uploadRepo.create({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      url,
      type: this.getFileType(file.mimetype),
      uploadedById: userId,
    });

    return this.uploadRepo.save(upload);
  }

  // Birdən çox fayl yüklə
async uploadMultipleFiles(files: Express.Multer.File[], userId?: string) {
  return Promise.all(
    files.map(file => this.uploadFile(file, userId))
  );
}

  // Bütün faylları gətir
  async findAll(userId?: string) {
    const where = userId ? { uploadedById: userId } : {};

    return this.uploadRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  // Bir faylı gətir
  async findOne(id: string) {
    const upload = await this.uploadRepo.findOne({ where: { id } });

    if (!upload) {
      throw new NotFoundException('Fayl tapılmadı');
    }

    return upload;
  }

  // Faylı sil
  async delete(id: string, userId?: string) {
    const upload = await this.findOne(id);

    // Əgər userId verilmişsə, yalnız öz faylını silə bilər
    if (userId && upload.uploadedById !== userId) {
      throw new BadRequestException('Bu faylı silmək icazəniz yoxdur');
    }

    // Fiziki faylı sil
    if (fs.existsSync(upload.path)) {
      fs.unlinkSync(upload.path);
    }

    await this.uploadRepo.remove(upload);
    return { message: 'Fayl uğurla silindi' };
  }

  // İstifadəçinin fayllarını sil
  async deleteUserFiles(userId: string) {
    const uploads = await this.uploadRepo.find({
      where: { uploadedById: userId },
    });

    for (const upload of uploads) {
      if (fs.existsSync(upload.path)) {
        fs.unlinkSync(upload.path);
      }
    }

    await this.uploadRepo.remove(uploads);
  }
}