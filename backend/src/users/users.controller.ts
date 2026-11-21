import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}
  @Get('search') search(@Query('q') q = '') { return q.trim().length < 2 ? [] : this.users.search(q.trim()); }
  @Get(':username') profile(@Param('username') username: string) { return this.users.profile(username); }
  @UseGuards(JwtAuthGuard)
  @Post(':username/follow') follow(@CurrentUser() user: { sub: string }, @Param('username') username: string) { return this.users.follow(user.sub, username); }
}