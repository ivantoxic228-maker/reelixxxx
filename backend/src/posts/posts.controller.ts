import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PostsService } from './posts.service';
class CreatePostDto {
  @IsString() @MinLength(8) @MaxLength(2048) videoUrl!: string;
  @IsOptional() @IsString() @MaxLength(2200) caption?: string;
  @IsOptional() @IsString() @MaxLength(2048) thumbnailUrl?: string;
  @IsOptional() @IsString() @MaxLength(300) publicId?: string;
  @IsOptional() @IsNumber() @Min(0) duration?: number;
  @IsOptional() @IsString() @MaxLength(100) soundId?: string;
}
class CommentDto { @IsString() @MinLength(1) @MaxLength(1000) text!: string; }
class ViewDto { @IsNumber() @Min(0) watchMs!: number; }
@Controller('posts')
export class PostsController {
  constructor(private posts: PostsService) {}
  @Get('feed') feed(@Query('cursor') cursor?: string) { return this.posts.feed(cursor); }
  @Get('sounds') sounds() { return this.posts.sounds(); }
  @UseGuards(JwtAuthGuard)
  @Get('recommended') recommended(@CurrentUser() user: { sub: string }) { return this.posts.recommended(user.sub); }
  @Get(':id/comments') comments(@Param('id') id: string) { return this.posts.comments(id); }
  @UseGuards(JwtAuthGuard)
  @Post() create(@CurrentUser() user: { sub: string }, @Body() body: CreatePostDto) { return this.posts.create(user.sub, body); }
  @UseGuards(JwtAuthGuard)
  @Delete(':id') remove(@CurrentUser() user: { sub: string }, @Param('id') id: string) { return this.posts.remove(user.sub, id); }
  @UseGuards(JwtAuthGuard)
  @Post(':id/view') view(@CurrentUser() user: { sub: string }, @Param('id') id: string, @Body() body: ViewDto) { return this.posts.recordView(user.sub, id, body.watchMs); }
  @UseGuards(JwtAuthGuard)
  @Post(':id/like') like(@CurrentUser() user: { sub: string }, @Param('id') id: string) { return this.posts.toggleLike(user.sub, id); }
  @UseGuards(JwtAuthGuard)
  @Post(':id/comments') comment(@CurrentUser() user: { sub: string }, @Param('id') id: string, @Body() body: CommentDto) { return this.posts.comment(user.sub, id, body.text); }
}
