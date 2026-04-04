import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS
  app.enableCors();

    // ✅ Uploads qovluqlarını yarat
  const uploadsDir = join(__dirname, '..', 'uploads');
  const avatarsDir = join(uploadsDir, 'avatars');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
  if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir);
  }
  // Static files (uploads folder)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription('Blog platforması üçün REST API dokumentasiyası')
    .setVersion('1.0')
    .addTag('Auth', 'Autentifikasiya endpointləri')
    .addTag('Users', 'İstifadəçi idarəetməsi')
    .addTag('Posts', 'Post əməliyyatları')
    .addTag('Comments', 'Şərh əməliyyatları')
    .addTag('Upload', 'Fayl yükləmə') // ✅
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT token daxil edin',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const PORT = process.env.PORT || 3003;
  await app.listen(PORT);

  console.log('🚀 Server işləyir:', `http://localhost:${PORT}`);
  console.log('📚 Swagger dokumentasiyası:', `http://localhost:${PORT}/api/docs`);
  console.log('✅ Super Admin yoxlanılır...');
}

bootstrap();