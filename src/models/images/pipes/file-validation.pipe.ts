import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { imageConfig } from '../image.config';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(
    private readonly maxSize: number = imageConfig.maxImageSizeBytes,
    private readonly allowedMimeTypes: string[] = imageConfig.allowedMimeTypes,
  ) {}

  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Validate file size
    if (file.size > this.maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxSize / 1024 / 1024}MB`,
      );
    }

    // Validate MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    return file;
  }
}
