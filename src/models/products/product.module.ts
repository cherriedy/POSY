import { Global, Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { CreateProductModule } from './create-product/create-product.module';
import { UpdateProductModule } from './update-product/update-product.module';
import { GetProductsModule } from './get-products/get-products.module';
import { DeleteProductModule } from './delete-product/delete-product.module';
import { GetAttributesModule } from './get-attributes/get-attributes.module';
import { UpsertAttributesModule } from './upsert-attributes/upsert-attributes.module';
import { GetProductIngredientsModule } from './get-product-ingredients/get-product-ingredients.module';
import { RemoveProductIngredientModule } from './remove-product-ingredient/remove-product-ingredient.module';
import { UpsertIngredientsModule } from './upsert-ingredients/upsert-ingredients.module';
import { ProductRepositoryModule } from './repositories/product-repository.module';
import { PublicProductController } from './public-product.controller';
import { GetCategoriesModule } from '../categories/features/get-categories/get-categories.module';
import { ProductFacadeService } from './product-facade.service';

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
    GetCategoriesModule,
  ],
  controllers: [ProductController, PublicProductController],
  providers: [ProductFacadeService],
  exports: [ProductRepositoryModule],
})
export class ProductModule {}
