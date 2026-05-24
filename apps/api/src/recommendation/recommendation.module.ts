import { Module } from '@nestjs/common';
import { RecommendationService } from '@posy/recommendation/features/recommendation.service';
import { HttpModule } from '@nestjs/axios';
import { ProductRepositoryModule } from '@posy/products/repositories/product-repository.module';
import { PythonConfigModule } from '@posy/shared';
import { RecommendationController } from './recommendation.controller';
import { UserTrackingModule } from '../user-tracking/user-tracking.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    PythonConfigModule,
    ProductRepositoryModule,
    UserTrackingModule,
  ],
  providers: [RecommendationService],
  exports: [RecommendationService],
  controllers: [RecommendationController],
})
export class RecommendationModule {}
