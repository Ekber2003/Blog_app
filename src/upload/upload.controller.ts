import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from 'src/auth/decorators/user.decorators';
import { Role } from 'src/users/entities/user.etity';
import { multerConfig, imageMulterConfig } from './multer.config';

@Controller('upload')
@ApiTags('Upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // Tək fayl yüklə (şəkil, PDF, video)
  @Post('file')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiOperation({ summary: 'Tək fayl yüklə (şəkil, PDF, video)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @User() user,
  ) {
    return this.uploadService.uploadFile(file, user.userId);
  }

  // Yalnız şəkil yüklə
  @Post('image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('image', imageMulterConfig))
  @ApiOperation({ summary: 'Tək şəkil yüklə' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @User() user,
  ) {
    return this.uploadService.uploadFile(file, user.userId);
  }

  // Birdən çox fayl yüklə (max 10)
  @Post('multiple')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FilesInterceptor('files', 10, multerConfig))
  @ApiOperation({ summary: 'Birdən çox fayl yüklə (max 10)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @User() user,
  ) {
    return this.uploadService.uploadMultipleFiles(files, user.userId);
  }

  // Bütün faylları gətir
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Bütün yüklənmiş faylları gətir' })
  findAll(@User() user) {
    return this.uploadService.findAll(user.userId);
  }

  // Bütün faylları gör (Admin)
  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Bütün sistemdəki faylları gətir (Admin)' })
  findAllAdmin() {
    return this.uploadService.findAll();
  }

  // Bir faylı gətir
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Fayl ID ilə gətir' })
  findOne(@Param('id') id: string) {
    return this.uploadService.findOne(id);
  }

  // Faylı sil
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Faylı sil' })
  delete(@Param('id') id: string, @User() user) {
    return this.uploadService.delete(id, user.userId);
  }

  // Faylı sil (Admin)
  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'İstənilən faylı sil (Admin)' })
  deleteAdmin(@Param('id') id: string) {
    return this.uploadService.delete(id);
  }
}