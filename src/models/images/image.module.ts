import { Global, Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageRepository, ImageRepositoryImpl } from './repositories';
import { ImageService } from './image.service';
import { AppConfigModule } from '../../config';
import { ImageUrlTransformInterceptor } from './interceptors';

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
