import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { HttpModule } from '@nestjs/axios';
import { ProductRepositoryModule } from '../models/products/repositories/product-repository.module';
import { PythonConfigModule } from '../config/python/config.module';
import { RecommendationController } from './recommendation.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    PythonConfigModule,
    ProductRepositoryModule,
  ],
  providers: [RecommendationService],
  exports: [RecommendationService],
  controllers: [RecommendationController],
})
export class RecommendationModule {}
