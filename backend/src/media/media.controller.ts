import { Controller, Post, UseGuards } from '@nestjs/common';
import { MediaService } from './media.service';
// TODO: protect this endpoint with the real Reelix access-token guard before public launch.
@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}
  @Post('signature')
  createUploadSignature() { return this.media.createUploadSignature(); }
}
