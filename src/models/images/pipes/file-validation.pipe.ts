import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { imageConfig } from '../image.config';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(
    private readonly maxSize: number = imageConfig.maxImageSizeBytes,
    private readonly allowedMimeTypes: string[] = imageConfig.allowedMimeTypes,
  ) {}

  transform(files: Express.Multer.File[]): Express.Multer.File[] {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    for (const file of files) {
      if (file.size > this.maxSize) {
        throw new BadRequestException(
          `File "${file.originalname}" exceeds ${this.maxSize / 1024 / 1024}MB`,
        );
      }

      if (!this.allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `Invalid file type "${file.originalname}". Allowed: ${this.allowedMimeTypes.join(', ')}`,
        );
      }
    }

    return files;
  }
}