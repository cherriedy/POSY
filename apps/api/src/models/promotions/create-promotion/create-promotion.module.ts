import { Module } from '@nestjs/common';
import { CreatePromotionService } from './create-promotion.service';
import { CategoryModule } from '../../categories/category.module';
import { ProductsModule } from '@posy/products/products.module';

@Module({
  imports: [CategoryModule, ProductsModule],
  providers: [CreatePromotionService],
  exports: [CreatePromotionService],
})
export class CreatePromotionModule {}
