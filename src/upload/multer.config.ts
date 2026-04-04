import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

// İcazə verilən fayl tipləri
const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/webm'];

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads', // Fayllar buraya yüklənəcək
    filename: (req, file, callback) => {
      // Unikal ad yarat
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const filename = `${uniqueSuffix}${ext}`;
      callback(null, filename);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      ...allowedImageTypes,
      ...allowedDocTypes,
      ...allowedVideoTypes,
    ];

    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new BadRequestException(
          'Yalnız şəkil, PDF və video faylları yükləyə bilərsiniz',
        ),
        false,
      );
    }
  },
};

// Yalnız şəkil üçün
export const imageMulterConfig = {
  ...multerConfig,
  fileFilter: (req, file, callback) => {
    if (allowedImageTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new BadRequestException('Yalnız şəkil faylları yükləyə bilərsiniz'),
        false,
      );
    }
  },
};