import { Global, Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { PrismaModule } from 'src/providers/prisma/prisma.module';
import {
  CreateCategoryModule,
  UpdateCategoryModule,
  DeleteCategoryModule,
  GetCategoriesModule,
} from './features';
import { CategoryRepository, CategoryRepositoryImpl } from './shared';

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
