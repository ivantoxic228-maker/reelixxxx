import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private db: PrismaService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;
    if (!userId) throw new ForbiddenException('Доступ только администраторам');
    const user = await this.db.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (user?.role !== 'ADMIN') throw new ForbiddenException('Доступ только администраторам');
    return true;
  }
}
