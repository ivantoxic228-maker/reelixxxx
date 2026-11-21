import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class UsersService {
  constructor(private db: PrismaService) {}
  async me(userId: string) {
    const user = await this.db.user.findUnique({ where: { id: userId }, select: { id: true, email: true, username: true, displayName: true, avatarUrl: true, bio: true, isPrivate: true, createdAt: true, _count: { select: { posts: true, followers: true, following: true } } } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }
  async updateMe(userId: string, input: { displayName?: string; bio?: string; avatarUrl?: string | null; isPrivate?: boolean }) {
    return this.db.user.update({ where: { id: userId }, data: input, select: { id: true, email: true, username: true, displayName: true, avatarUrl: true, bio: true, isPrivate: true, updatedAt: true } });
  }
  myPosts(userId: string) {
    return this.db.post.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 100, include: { sound: true, _count: { select: { likes: true, comments: true } } } });
  }
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
    if (target.isPrivate) throw new BadRequestException('Закрытый аккаунт: заявки на подписку пока не поддерживаются');
    const key = { followerId_followingId: { followerId, followingId: target.id } };
    const exists = await this.db.follow.findUnique({ where: key });
    if (exists) { await this.db.follow.delete({ where: key }); return { following: false }; }
    await this.db.follow.create({ data: { followerId, followingId: target.id } });
    return { following: true, requiresApproval: target.isPrivate };
  }
}