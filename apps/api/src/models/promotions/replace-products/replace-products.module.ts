import { Module } from '@nestjs/common';
import { ReplacePromotionProductService } from './replace-products.service';

@Module({
  providers: [ReplacePromotionProductService],
  exports: [ReplacePromotionProductService],
})
export class ReplacePromotionProductModule {}
