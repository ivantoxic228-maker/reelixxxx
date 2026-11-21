import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class MediaService {
  constructor(private readonly config: ConfigService) {}

  createUploadSignature() {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');
    if (!cloudName || !apiKey || !apiSecret) {
      throw new InternalServerErrorException('Media storage is not configured');
    }
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'reelix/uploads';
    const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, apiSecret);
    return { cloudName, apiKey, timestamp, folder, signature };
  }
}
