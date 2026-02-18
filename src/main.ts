import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors();

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger konfiqurasiyası
  const config = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription('Blog platforması üçün REST API dokumentasiyası')
    .setVersion('1.0')
    .addTag('Auth', 'Autentifikasiya endpointləri')
    .addTag('Users', 'İstifadəçi idarəetməsi')
    .addTag('Posts', 'Post əməliyyatları')
    .addTag('Comments', 'Şərh əməliyyatları')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT token daxil edin',
        in: 'header',
      },
      'JWT-auth', // Bu adı controller-lərdə istifadə edəcəyik
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