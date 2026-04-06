import { Module } from '@nestjs/common';
import { ProductRepository } from './product-repository.abstract';
import { ProductRepositoryImpl } from './product-repository';
import { ProductAttributeRepository } from './product-attribute-repository.abstract';
import { ProductAttributeRepositoryImpl } from './product-attribute-repository';
import { ProductIngredientRepository } from './product-ingredient-repository.abstract';
import { ProductIngredientRepositoryImpl } from './product-ingredient-repository';
import { MeilisearchModule } from '../../../providers/meilisearch/meilisearch.module';
import { SeasonalPatternRepository } from './seasonal-pattern-repository.abstract';
import { SeasonalPatternRepositoryImpl } from './seasonal-pattern-repository';

@Module({
  imports: [MeilisearchModule],
  providers: [
    {
      provide: ProductRepository,
      useClass: ProductRepositoryImpl,
    },
    {
      provide: ProductAttributeRepository,
      useClass: ProductAttributeRepositoryImpl,
    },
    {
      provide: ProductIngredientRepository,
      useClass: ProductIngredientRepositoryImpl,
    },
    {
      provide: SeasonalPatternRepository,
      useClass: SeasonalPatternRepositoryImpl,
    },
  ],
  exports: [
    ProductRepository,
    ProductAttributeRepository,
    ProductIngredientRepository,
    SeasonalPatternRepository,
  ],
})
export class ProductRepositoryModule {}
