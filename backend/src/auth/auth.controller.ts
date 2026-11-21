import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
class RegisterDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(3) @MaxLength(24) username!: string;
  @IsString() @MinLength(1) @MaxLength(40) displayName!: string;
  @IsString() @MinLength(10) @MaxLength(100) password!: string;
}
class LoginDto {
  @IsString() @MinLength(1) login!: string;
  @IsString() @MinLength(1) password!: string;
}
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}
  @Post('register') register(@Body() body: RegisterDto) { return this.auth.register(body); }
  @Post('login') login(@Body() body: LoginDto) { return this.auth.login(body); }
}