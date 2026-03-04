import { Global, Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import {
  ProductRepository,
  ProductRepositoryImpl,
  ProductAttributeRepository,
  ProductAttributeRepositoryImpl,
  ProductIngredientRepository,
  ProductIngredientRepositoryImpl,
} from './repositories';
import { CreateProductModule } from './create-product';
import { UpdateProductModule } from './update-product';
import { GetProductsModule } from './get-products';
import { DeleteProductModule } from './delete-product';
import { GetAttributesModule } from './get-attributes';
import { UpsertAttributesModule } from './upsert-attributes';
import { MeilisearchModule } from '../../providers/meilisearch/meilisearch.module';
import { GetProductIngredientsModule } from './get-product-ingredients';
import { RemoveProductIngredientModule } from './remove-product-ingredient';
import { UpsertIngredientsModule } from './upsert-ingredients';

@Global()
@Module({
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
  ],
  exports: [
    ProductRepository,
    ProductAttributeRepository,
    ProductIngredientRepository,
  ],
  imports: [
    CreateProductModule,
    UpdateProductModule,
    GetProductsModule,
    DeleteProductModule,
    GetAttributesModule,
    UpsertAttributesModule,
    MeilisearchModule,
    GetProductIngredientsModule,
    RemoveProductIngredientModule,
    UpsertIngredientsModule,
  ],
  controllers: [ProductController],
})
export class ProductModule {}
