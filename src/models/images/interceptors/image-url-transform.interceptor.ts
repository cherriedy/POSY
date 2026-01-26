import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfigService } from '../../../config/app/config.service';
import { Image } from '../types';

/**
 * Interceptor that transforms image paths to full URLs in all responses from the Image controller.
 *
 * - Adds a `url` property to Image objects based on the configured base URL (from AppConfigService).
 * - Handles single Image objects, arrays of Images, and nested/paginated structures.
 * - Preserves the original `path` property and does not mutate other fields.
 *
 * @Example:
 *   { path: 'uploads/abc.jpg', ... } => { path: 'uploads/abc.jpg', url: 'http://host/uploads/abc.jpg', ... }
 *
 * @Usage:
 *   Apply as a controller-level interceptor to automatically enhance all image responses.
 */
@Injectable()
export class ImageUrlTransformInterceptor implements NestInterceptor {
  /**
   * @param appConfigService - Injected service to access the application's base URL
   */
  constructor(private readonly appConfigService: AppConfigService) {}

  /**
   * Intercepts the response stream and transforms any Image objects or arrays of Images
   * by adding a `url` property with the full URL to the image file.
   *
   * @param context - The execution context of the request
   * @param next - The call handler for the next interceptor or route handler
   * @returns Observable<any> - The transformed response stream
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (!data) return data;

        // Handle single Image object
        if (Image.isValid(data)) {
          return this.addUrlToImage(data);
        }

        // Handle array of Images
        if (Array.isArray(data) && data.length > 0 && Image.isValid(data[0])) {
          return data.map((image: unknown) =>
            Image.isValid(image) ? this.addUrlToImage(image) : image,
          );
        }

        // Handle paginated response or nested structure
        if (typeof data === 'object') {
          return this.transformNestedImages(data);
        }

        return data;
      }),
    );
  }

  /**
   * Generates a full URL from a relative image path.
   *
   * @param path - The relative path to the image file (e.g., 'uploads/abc.jpg')
   * @returns The full URL to access the image (e.g., 'http://host/uploads/abc.jpg')
   */
  private generateImageUrl(path: string): string {
    const baseUrl = this.appConfigService.url;
    // Remove leading './' if present
    const cleanPath = path.replace(/^\.\//, '');
    return `${baseUrl}/${cleanPath}`;
  }

  /**
   * Adds a `url` property to an Image object based on its `path`.
   *
   * @param image - The Image object to enhance
   * @returns The same Image object with a `url` property added
   */
  private addUrlToImage(image: Image): Image {
    if (image.path) {
      image.path = this.generateImageUrl(image.path);
    }
    return image;
  }

  /**
   * Recursively traverses an object or array, transforming any nested Image objects
   * by adding a `url` property to each.
   *
   * @param obj - The object or array to transform
   * @returns The transformed object or array with URLs added to all Image objects
   */
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
