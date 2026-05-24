import { Global, Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageRepository } from '@posy/images/shared/repositories/image-repository.abstract';
import { PrismaImageRepository } from '@posy/images/shared/repositories/prisma-image-repository';
import { ImageService } from './image.service';
import { AppConfigModule } from '@posy/shared';
import { ImageUrlTransformInterceptor } from '@posy/images/shared/interceptors/image-url-transform.interceptor';

@Global()
@Module({
  imports: [AppConfigModule],
  providers: [
    {
      provide: ImageRepository,
      useClass: PrismaImageRepository,
    },
    ImageService,
    ImageUrlTransformInterceptor,
  ],
  controllers: [ImageController],
  exports: [ImageRepository],
})
export class ImageModule {}
