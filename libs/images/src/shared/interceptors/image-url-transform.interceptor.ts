import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfigService } from '@posy/shared';
import { Image } from '../entities/image';

@Injectable()
export class ImageUrlTransformInterceptor implements NestInterceptor {
  constructor(private readonly appConfigService: AppConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (!data) return data;

        if (Image.isValid(data)) {
          return this.addUrlToImage(data);
        }

        if (Array.isArray(data) && data.length > 0 && Image.isValid(data[0])) {
          return data.map((image: unknown) =>
            Image.isValid(image) ? this.addUrlToImage(image) : image,
          );
        }

        if (typeof data === 'object') {
          return this.transformNestedImages(data);
        }

        return data;
      }),
    );
  }

  private generateImageUrl(path: string): string {
    if (path.startsWith('http')) return path;
    const baseUrl = this.appConfigService.url;

    let cleanPath = path.replace(/\\/g, '/');
    cleanPath = cleanPath.replace(/^\.\//, '');

    const safeBase = baseUrl.replace(/\/$/, '');

    return `${safeBase}/${cleanPath}`;
  }

  private addUrlToImage(image: Image): Image {
    if (image.path) {
      image.path = this.generateImageUrl(image.path);
    }
    return image;
  }

  private transformNestedImages(obj: unknown): unknown {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item: unknown) => this.transformNestedImages(item));
    }

    if (Image.isValid(obj)) {
      return this.addUrlToImage(obj);
    }

    const transformed: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        transformed[key] = this.transformNestedImages(
          (obj as Record<string, unknown>)[key],
        );
      }
    }
    return transformed;
  }
}
