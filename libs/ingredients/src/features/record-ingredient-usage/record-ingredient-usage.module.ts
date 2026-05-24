import { Module } from '@nestjs/common';
import { RecordIngredientUsageService } from './record-ingredient-usage.service';
import { ProductRepositoryModule } from '@posy/products/repositories/product-repository.module';

@Module({
  imports: [ProductRepositoryModule],
  providers: [RecordIngredientUsageService],
  exports: [RecordIngredientUsageService],
})
export class RecordIngredientUsageModule {}
