import { Global, Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageRepository } from './repositories/image.repository-abstract';
import { ImageRepositoryImpl } from './repositories/image.repository-implementation';
import { ImageService } from './image.service';
import { AppConfigModule } from '../../config/app/config.module';
import { ImageUrlTransformInterceptor } from './interceptors/image-url-transform.interceptor';

@Global()
@Module({
  imports: [AppConfigModule],
  providers: [
    {
      provide: ImageRepository,
      useClass: ImageRepositoryImpl,
    },
    ImageService,
    ImageUrlTransformInterceptor,
  ],
  controllers: [ImageController],
  exports: [ImageRepository],
})
export class ImageModule {}
