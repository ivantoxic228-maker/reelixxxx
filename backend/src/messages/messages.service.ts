import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class MessagesService {
  constructor(private db: PrismaService) {}
  async send(senderId: string, username: string, text: string) {
    const receiver = await this.db.user.findUnique({ where: { username: username.toLowerCase() } });
    if (!receiver) throw new NotFoundException('Пользователь не найден');
    if (receiver.id === senderId) throw new NotFoundException('Нельзя отправить сообщение самому себе');
    return this.db.message.create({ data: { senderId, receiverId: receiver.id, text }, include: { sender: { select: { id: true, username: true, displayName: true } } } });
  }
  async conversations(userId: string) {
    const rows = await this.db.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: 'desc' }, take: 200,
      include: { sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } }, receiver: { select: { id: true, username: true, displayName: true, avatarUrl: true } } }
    });
    const result = new Map<string, { user: typeof rows[number]['sender']; lastMessage: { text: string; createdAt: Date; senderId: string }; unreadCount: number }>();
    for (const message of rows) {
      const partner = message.senderId === userId ? message.receiver : message.sender;
      const current = result.get(partner.id);
      if (!current) result.set(partner.id, { user: partner, lastMessage: { text: message.text, createdAt: message.createdAt, senderId: message.senderId }, unreadCount: message.receiverId === userId && !message.readAt ? 1 : 0 });
      else if (message.receiverId === userId && !message.readAt) current.unreadCount += 1;
    }
    return Array.from(result.values());
  }
  async list(userId: string, username: string) {
    const partner = await this.db.user.findUnique({ where: { username: username.toLowerCase() }, select: { id: true } });
    if (!partner) throw new NotFoundException('Пользователь не найден');
    await this.db.message.updateMany({ where: { senderId: partner.id, receiverId: userId, readAt: null }, data: { readAt: new Date() } });
    return this.db.message.findMany({
      where: { OR: [{ senderId: partner.id, receiverId: userId }, { senderId: userId, receiverId: partner.id }] },
      orderBy: { createdAt: 'asc' }, take: 200,
      include: { sender: { select: { id: true, username: true, displayName: true } } }
    });
  }
}
