import { Module } from '@nestjs/common';
import { RecordIngredientUsageService } from './record-ingredient-usage.service';
import { ProductRepositoryModule } from '../../../products/repositories/product-repository.module';

@Module({
  imports: [ProductRepositoryModule],
  providers: [RecordIngredientUsageService],
  exports: [RecordIngredientUsageService],
})
export class RecordIngredientUsageModule {}
