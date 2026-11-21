import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MeController } from './me.controller';
import { JwtAuthGuard } from './jwt-auth.guard';
@Module({
  imports: [JwtModule.registerAsync({ global: true, inject: [ConfigService], useFactory: (c: ConfigService) => ({ secret: c.getOrThrow<string>('JWT_ACCESS_SECRET'), signOptions: { expiresIn: '15m' } }) })],
  controllers: [AuthController, MeController], providers: [AuthService, JwtAuthGuard], exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
