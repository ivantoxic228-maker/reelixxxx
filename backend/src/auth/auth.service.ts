import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
@Injectable()
export class AuthService {
  constructor(private db: PrismaService, private jwt: JwtService, private config: ConfigService) {}
  private safe(user: any) { const { passwordHash, ...result } = user; return result; }
  async register(input: { email: string; username: string; displayName: string; password: string }) {
    const email = input.email.trim().toLowerCase();
    const username = input.username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,24}$/.test(username)) throw new BadRequestException('Имя пользователя: 3–24 символа, латиница, цифры и _');
    if (input.password.length < 10) throw new BadRequestException('Пароль должен содержать минимум 10 символов');
    const exists = await this.db.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (exists) throw new BadRequestException('Почта или имя пользователя уже заняты');
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.db.user.create({ data: { email, username, displayName: input.displayName.trim(), passwordHash } });
    return this.issue(user);
  }
  async login(input: { login: string; password: string }) {
    const value = input.login.trim().toLowerCase();
    const user = await this.db.user.findFirst({ where: { OR: [{ email: value }, { username: value }] } });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) throw new UnauthorizedException('Неверный логин или пароль');
    return this.issue(user);
  }
  private async issue(user: any) {
    const accessToken = await this.jwt.signAsync({ sub: user.id, username: user.username });
    return { accessToken, tokenType: 'Bearer', expiresIn: 900, user: this.safe(user) };
  }
}