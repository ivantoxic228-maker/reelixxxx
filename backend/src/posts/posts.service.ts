import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class PostsService {
  constructor(private db: PrismaService) {}
  async feed(cursor?: string) {
    const rows = await this.db.post.findMany({ take: 12, ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}), orderBy: { createdAt: 'desc' }, where: { user: { isPrivate: false } }, include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } }, _count: { select: { likes: true, comments: true } } } });
    return { items: rows, nextCursor: rows.length === 12 ? rows[rows.length - 1].id : null };
  }
  create(userId: string, input: { videoUrl: string; caption?: string; thumbnailUrl?: string; publicId?: string; duration?: number }) {
    return this.db.post.create({ data: { ...input, caption: input.caption ?? '', userId } });
  }
  async remove(userId: string, id: string) {
    const post = await this.db.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Публикация не найдена');
    if (post.userId !== userId) throw new ForbiddenException('Можно удалять только свои публикации');
    await this.db.post.delete({ where: { id } });
    return { success: true };
  }
  async toggleLike(userId: string, postId: string) {
    const post = await this.db.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Публикация не найдена');
    const where = { userId_postId: { userId, postId } };
    const existing = await this.db.like.findUnique({ where });
    if (existing) { await this.db.like.delete({ where }); return { liked: false }; }
    await this.db.like.create({ data: { userId, postId } });
    return { liked: true };
  }
  async comment(userId: string, postId: string, text: string) {
    if (!(await this.db.post.findUnique({ where: { id: postId } }))) throw new NotFoundException('Публикация не найдена');
    return this.db.comment.create({ data: { userId, postId, text }, include: { user: { select: { username: true, displayName: true, avatarUrl: true } } } });
  }
  comments(postId: string) {
    return this.db.comment.findMany({ where: { postId }, orderBy: { createdAt: 'asc' }, take: 100, include: { user: { select: { username: true, displayName: true, avatarUrl: true } } } });
  }
}