import { Global, Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import {
  ProductRepository,
  ProductRepositoryImpl,
  ProductAttributeRepository,
  ProductAttributeRepositoryImpl,
} from './repositories';
import { CreateProductModule } from './create-product/create-product.module';
import { UpdateProductModule } from './update-product/update-product.module';
import { GetProductsModule } from './get-products/get-products.module';
import { DeleteProductModule } from './delete-product/delete-product.module';
import { GetAttributesModule } from './get-attributes/get-attributes.module';
import { UpsertAttributesModule } from './upsert-attributes/upsert-attributes.module';
import { MeilisearchModule } from '../../providers/meilisearch/meilisearch.module';

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
  ],
  exports: [ProductRepository, ProductAttributeRepository],
  imports: [
    CreateProductModule,
    UpdateProductModule,
    GetProductsModule,
    DeleteProductModule,
    GetAttributesModule,
    UpsertAttributesModule,
    MeilisearchModule,
  ],
  controllers: [ProductController],
})
export class ProductModule {}
