import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MessagesService } from './messages.service';
class SendMessageDto { @IsString() @MinLength(1) @MaxLength(4000) text!: string; }
@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messages: MessagesService) {}
  @Get(':username') list(@CurrentUser() user: { sub: string }, @Param('username') username: string) { return this.messages.list(user.sub, username); }
  @Post(':username') send(@CurrentUser() user: { sub: string }, @Param('username') username: string, @Body() body: SendMessageDto) { return this.messages.send(user.sub, username, body.text); }
}