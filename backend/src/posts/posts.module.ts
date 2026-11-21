import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@Module({ controllers: [PostsController], providers: [PostsService, JwtAuthGuard] })
export class PostsModule {}