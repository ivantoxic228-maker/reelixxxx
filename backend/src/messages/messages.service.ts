import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class MessagesService {
  constructor(private db: PrismaService) {}
  async send(senderId: string, username: string, text: string) {
    const receiver = await this.db.user.findUnique({ where: { username: username.toLowerCase() } });
    if (!receiver) throw new NotFoundException('Пользователь не найден');
    return this.db.message.create({ data: { senderId, receiverId: receiver.id, text } });
  }
  list(userId: string, username: string) {
    return this.db.message.findMany({ where: { OR: [{ sender: { username: username.toLowerCase() }, receiverId: userId }, { senderId: userId, receiver: { username: username.toLowerCase() } }] }, orderBy: { createdAt: 'asc' }, take: 200 });
  }
}