import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
class ModeratePostDto {
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsBoolean() isHidden?: boolean;
}
class SoundDto {
  @IsString() @MaxLength(100) title!: string;
  @IsString() @MaxLength(100) artist!: string;
  @IsString() @MaxLength(2048) audioUrl!: string;
  @IsOptional() @IsString() @MaxLength(2048) coverUrl?: string;
  @IsOptional() @IsNumber() @Min(0) duration?: number;
  @IsOptional() @IsString() @MaxLength(40) source?: string;
}
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private db: PrismaService) {}
  @Get('overview')
  async overview() {
    const [users, posts, hidden, featured, sounds] = await Promise.all([
      this.db.user.count(), this.db.post.count(), this.db.post.count({ where: { isHidden: true } }),
      this.db.post.count({ where: { isFeatured: true, isHidden: false } }), this.db.sound.count({ where: { isActive: true } })
    ]);
    return { users, posts, hidden, featured, sounds };
  }
  @Get('posts')
  posts() {
    return this.db.post.findMany({ take: 100, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, username: true, displayName: true, isVerified: true } }, _count: { select: { likes: true, comments: true } } } });
  }
  @Patch('posts/:id')
  moderate(@Param('id') id: string, @Body() body: ModeratePostDto) {
    return this.db.post.update({ where: { id }, data: body, include: { user: { select: { username: true } } } });
  }
  @Delete('posts/:id')
  async removePost(@Param('id') id: string) {
    await this.db.post.delete({ where: { id } });
    return { success: true };
  }
  @Get('users')
  users() {
    return this.db.user.findMany({ take: 100, orderBy: { createdAt: 'desc' }, select: { id: true, username: true, displayName: true, isVerified: true, role: true, createdAt: true } });
  }
  @Patch('users/:id/verification')
  verify(@Param('id') id: string, @Body() body: { isVerified: boolean }) {
    return this.db.user.update({ where: { id }, data: { isVerified: body.isVerified }, select: { id: true, username: true, isVerified: true } });
  }
  @Get('sounds')
  sounds() { return this.db.sound.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }); }
  @Post('sounds')
  createSound(@Body() body: SoundDto) { return this.db.sound.create({ data: body }); }
  @Patch('sounds/:id')
  updateSound(@Param('id') id: string, @Body() body: { isActive?: boolean }) {
    return this.db.sound.update({ where: { id }, data: body });
  }
}
