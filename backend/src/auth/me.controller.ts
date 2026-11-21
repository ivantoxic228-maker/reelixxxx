import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
@Controller('users')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private db: PrismaService) {}
  @Get('me') async me(@CurrentUser() user: { sub: string }) {
    return this.db.user.findUnique({ where: { id: user.sub }, select: { id: true, username: true, displayName: true, bio: true, avatarUrl: true, isPrivate: true, createdAt: true } });
  }
}