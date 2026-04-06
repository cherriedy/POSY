import { Global, Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { CreateProductModule } from './create-product';
import { UpdateProductModule } from './update-product';
import { GetProductsModule } from './get-products';
import { DeleteProductModule } from './delete-product';
import { GetAttributesModule } from './get-attributes';
import { UpsertAttributesModule } from './upsert-attributes';
import { GetProductIngredientsModule } from './get-product-ingredients';
import { RemoveProductIngredientModule } from './remove-product-ingredient';
import { UpsertIngredientsModule } from './upsert-ingredients';
import { ProductRepositoryModule } from './repositories/product-repository.module';

@Global()
@Module({
  imports: [
    ProductRepositoryModule,
    CreateProductModule,
    UpdateProductModule,
    GetProductsModule,
    DeleteProductModule,
    GetAttributesModule,
    UpsertAttributesModule,
    GetProductIngredientsModule,
    RemoveProductIngredientModule,
    UpsertIngredientsModule,
    ProductRepositoryModule,
  ],
  controllers: [ProductController],
  exports: [ProductRepositoryModule],
})
export class ProductModule {}
