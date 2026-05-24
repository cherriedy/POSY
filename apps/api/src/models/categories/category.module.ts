import { Global, Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { PrismaModule } from 'src/providers/prisma/prisma.module';
import { CreateCategoryModule } from './features/create-category/create-category.module';
import { UpdateCategoryModule } from './features/update-category/update-category.module';
import { DeleteCategoryModule } from './features/delete-category/delete-category.module';
import { GetCategoriesModule } from './features/get-categories/get-categories.module';
import { CategoryRepository } from './shared/repositories/category-repository.abstract';
import { CategoryRepositoryImpl } from './shared/repositories/category-repository';

@Global()
@Module({
  providers: [
    {
      provide: CategoryRepository,
      useClass: CategoryRepositoryImpl,
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
