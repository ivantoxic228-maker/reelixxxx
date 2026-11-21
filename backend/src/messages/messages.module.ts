import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@Module({ controllers: [MessagesController], providers: [MessagesService, JwtAuthGuard] })
export class MessagesModule {}