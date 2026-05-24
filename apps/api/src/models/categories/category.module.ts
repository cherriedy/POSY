import { Global, Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { PrismaModule } from '@posy/shared';
import { CreateCategoryModule } from '@posy/categories/features/create-category/create-category.module';
import { UpdateCategoryModule } from '@posy/categories/features/update-category/update-category.module';
import { DeleteCategoryModule } from '@posy/categories/features/delete-category/delete-category.module';
import { GetCategoriesModule } from '@posy/categories/features/get-categories/get-categories.module';
import { CategoryRepository } from '@posy/categories/shared/repositories/category-repository.abstract';
import { PrismaCategoryRepository } from '@posy/categories/shared/repositories/prisma-category-repository';

@Global()
@Module({
  providers: [
    {
      provide: CategoryRepository,
      useClass: PrismaCategoryRepository,
    },
  ],
  imports: [
    PrismaModule,
    CreateCategoryModule,
    UpdateCategoryModule,
    DeleteCategoryModule,
    GetCategoriesModule,
  ],
  controllers: [CategoryController],
  exports: [CategoryRepository],
})
export class CategoryModule {}
