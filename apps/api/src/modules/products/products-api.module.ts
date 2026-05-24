import { Module } from '@nestjs/common';
import { ProductsModule } from '@posy/products';
import { GetCategoriesModule } from '../../models/categories/features/get-categories/get-categories.module';
import { ProductController } from './product.controller';
import { PublicProductController } from './public-product.controller';
import { ProductFacadeService } from './product-facade.service';

@Module({
  imports: [ProductsModule, GetCategoriesModule],
  controllers: [ProductController, PublicProductController],
  providers: [ProductFacadeService],
})
export class ProductsApiModule {}
