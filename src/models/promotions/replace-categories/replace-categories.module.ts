import { Module } from '@nestjs/common';
import { ReplacePromotionCategoriesService } from './replace-categories.service';

@Module({
  providers: [ReplacePromotionCategoriesService],
  exports: [ReplacePromotionCategoriesService],
})
export class ReplacePromotionCategoriesModule {}
