import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class PostsService {
  constructor(private db: PrismaService) {}
  async feed(cursor?: string) {
    const rows = await this.db.post.findMany({ take: 12, ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}), orderBy: { createdAt: 'desc' }, where: { isHidden: false, user: { isPrivate: false } }, include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true, isVerified: true } }, sound: true, _count: { select: { likes: true, comments: true } } } });
    return { items: rows, nextCursor: rows.length === 12 ? rows[rows.length - 1].id : null };
  }
  async recommended(userId: string) {
    const [rows, follows, liked] = await Promise.all([
      this.db.post.findMany({ where: { isHidden: false, user: { isPrivate: false }, userId: { not: userId } }, take: 100, orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }], include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true, isVerified: true } }, sound: true, _count: { select: { likes: true, comments: true } } } }),
      this.db.follow.findMany({ where: { followerId: userId }, select: { followingId: true } }),
      this.db.like.findMany({ where: { userId }, select: { postId: true } })
    ]);
    const followed = new Set(follows.map(x => x.followingId));
    const likedIds = new Set(liked.map(x => x.postId));
    const now = Date.now();
    const ranked = rows.map(post => {
      const ageHours = Math.max(0, (now - post.createdAt.getTime()) / 3600000);
      const freshness = Math.max(0, 72 - ageHours) / 72;
      const engagement = post._count.likes * 3 + post._count.comments * 5 + Math.min(post.views, 10000) * 0.08;
      const personalization = (followed.has(post.userId) ? 16 : 0) + (likedIds.has(post.id) ? -30 : 0);
      const score = (post.isFeatured ? 100 : 0) + engagement + freshness * 12 + personalization;
      return { ...post, recommendationScore: Math.round(score * 100) / 100 };
    }).sort((a, b) => b.recommendationScore - a.recommendationScore);
    return { items: ranked.slice(0, 30), algorithm: 'reelix-v1' };
  }
  async recordView(userId: string, postId: string, watchMs: number) {
    const post = await this.db.post.findUnique({ where: { id: postId }, select: { id: true, isHidden: true, user: { select: { isPrivate: true } } } });
    if (!post || post.isHidden || post.user.isPrivate) throw new NotFoundException('Видео не найдено');
    await this.db.$transaction([
      this.db.postView.create({ data: { postId, userId, watchMs, completed: watchMs >= 10000 } }),
      this.db.post.update({ where: { id: postId }, data: { views: { increment: 1 } } })
    ]);
    return { recorded: true };
  }
  sounds() { return this.db.sound.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' }, take: 100 }); }
  async create(userId: string, input: { videoUrl: string; caption?: string; thumbnailUrl?: string; publicId?: string; duration?: number; soundId?: string }) {
    if (input.soundId && !(await this.db.sound.findFirst({ where: { id: input.soundId, isActive: true } }))) throw new NotFoundException('Звук недоступен');
    return this.db.post.create({ data: { ...input, caption: input.caption ?? '', userId }, include: { sound: true } });
  }
  async remove(userId: string, id: string) {
    const post = await this.db.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Публикация не найдена');
    if (post.userId !== userId) throw new ForbiddenException('Можно удалять только свои публикации');
    await this.db.post.delete({ where: { id } });
    return { success: true };
  }
  async toggleLike(userId: string, postId: string) {
    const post = await this.db.post.findUnique({ where: { id: postId }, include: { user: { select: { isPrivate: true } } } });
    if (!post || post.isHidden) throw new NotFoundException('Публикация не найдена');
    if (post.user.isPrivate) throw new ForbiddenException('Публикация закрытого аккаунта недоступна');
    const where = { userId_postId: { userId, postId } };
    const existing = await this.db.like.findUnique({ where });
    if (existing) { await this.db.like.delete({ where }); return { liked: false }; }
    await this.db.like.create({ data: { userId, postId } });
    return { liked: true };
  }
  async comment(userId: string, postId: string, text: string) {
    const post = await this.db.post.findUnique({ where: { id: postId }, include: { user: { select: { isPrivate: true } } } });
    if (!post || post.isHidden) throw new NotFoundException('Публикация не найдена');
    if (post.user.isPrivate) throw new ForbiddenException('Публикация закрытого аккаунта недоступна');
    return this.db.comment.create({ data: { userId, postId, text }, include: { user: { select: { username: true, displayName: true, avatarUrl: true } } } });
  }
  async comments(postId: string) {
    const post = await this.db.post.findUnique({ where: { id: postId }, select: { isHidden: true, user: { select: { isPrivate: true } } } });
    if (!post || post.isHidden) throw new NotFoundException('Публикация не найдена');
    if (post.user.isPrivate) throw new ForbiddenException('Публикация закрытого аккаунта недоступна');
    return this.db.comment.findMany({ where: { postId }, orderBy: { createdAt: 'asc' }, take: 100, include: { user: { select: { username: true, displayName: true, avatarUrl: true } } } });
  }
}
