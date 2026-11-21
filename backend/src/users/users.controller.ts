import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
class UpdateProfileDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(40) displayName?: string;
  @IsOptional() @IsString() @MaxLength(160) bio?: string;
  @IsOptional() @IsString() @MaxLength(2048) avatarUrl?: string;
  @IsOptional() @IsBoolean() isPrivate?: boolean;
}
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}
  @UseGuards(JwtAuthGuard)
  @Get('me') me(@CurrentUser() user: { sub: string }) { return this.users.me(user.sub); }
  @UseGuards(JwtAuthGuard)
  @Patch('me') updateMe(@CurrentUser() user: { sub: string }, @Body() body: UpdateProfileDto) { return this.users.updateMe(user.sub, body); }
  @UseGuards(JwtAuthGuard)
  @Get('me/posts') myPosts(@CurrentUser() user: { sub: string }) { return this.users.myPosts(user.sub); }
  @Get('search') search(@Query('q') q = '') { return q.trim().length < 2 ? [] : this.users.search(q.trim()); }
  @Get(':username') profile(@Param('username') username: string) { return this.users.profile(username); }
  @UseGuards(JwtAuthGuard)
  @Post(':username/follow') follow(@CurrentUser() user: { sub: string }, @Param('username') username: string) { return this.users.follow(user.sub, username); }
}