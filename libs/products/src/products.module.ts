import { Global, Module } from '@nestjs/common';
import { ProductRepositoryModule } from './repositories/product-repository.module';
import { CreateProductModule } from './create-product/create-product.module';
import { UpdateProductModule } from './update-product/update-product.module';
import { GetProductsModule } from './get-products/get-products.module';
import { DeleteProductModule } from './delete-product/delete-product.module';
import { GetAttributesModule } from './get-attributes/get-attributes.module';
import { UpsertAttributesModule } from './upsert-attributes/upsert-attributes.module';
import { GetProductIngredientsModule } from './get-product-ingredients/get-product-ingredients.module';
import { RemoveProductIngredientModule } from './remove-product-ingredient/remove-product-ingredient.module';
import { UpsertIngredientsModule } from './upsert-ingredients/upsert-ingredients.module';

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
  ],
  exports: [ProductRepositoryModule],
})
export class ProductsModule {}
