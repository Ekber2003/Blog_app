import { Module, Post } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './ormconfig';
import { ClsGuard, ClsModule } from 'nestjs-cls';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SeedsModule } from './database/seeds/seeds.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { UploadModule } from './upload/upload.module';
import { ReactionModule } from './reaction/reaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:'.env'
    }),

    TypeOrmModule.forRoot(typeOrmConfig),

    AuthModule,
    UsersModule,
    PostModule,
    CommentModule,
    UploadModule,
    ReactionModule,
    SeedsModule, // ✅ Super Admin avtomatik yaranacaq
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
      guard: { mount: true },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: 'APP_GUARD', useClass: ClsGuard },
  ],
})
export class AppModule {}