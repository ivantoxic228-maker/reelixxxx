import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class UsersService {
  constructor(private db: PrismaService) {}
  search(q: string) {
    return this.db.user.findMany({ where: { OR: [{ username: { contains: q, mode: 'insensitive' } }, { displayName: { contains: q, mode: 'insensitive' } }] }, take: 20, select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true } });
  }
  async profile(username: string) {
    const user = await this.db.user.findUnique({ where: { username: username.toLowerCase() }, select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true, isPrivate: true, createdAt: true, _count: { select: { posts: true, followers: true, following: true } } } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }
  async follow(followerId: string, username: string) {
    const target = await this.db.user.findUnique({ where: { username: username.toLowerCase() } });
    if (!target) throw new NotFoundException('Пользователь не найден');
    if (target.id === followerId) throw new BadRequestException('Нельзя подписаться на себя');
    const key = { followerId_followingId: { followerId, followingId: target.id } };
    const exists = await this.db.follow.findUnique({ where: key });
    if (exists) { await this.db.follow.delete({ where: key }); return { following: false }; }
    await this.db.follow.create({ data: { followerId, followingId: target.id } });
    return { following: true, requiresApproval: target.isPrivate };
  }
}