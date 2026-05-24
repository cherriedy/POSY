import { Module } from '@nestjs/common';
import { IngredientRepository } from './ingredient-repository.abstract';
import { IngredientRepositoryImpl } from './ingredient-repository';
import { IngredientUsageRepository } from './ingredient-usage-repository.abstract';
import { IngredientUsageRepositoryImpl } from './ingredient-usage-repository';

@Module({
  providers: [
    { provide: IngredientRepository, useClass: IngredientRepositoryImpl },
    {
      provide: IngredientUsageRepository,
      useClass: IngredientUsageRepositoryImpl,
    },
  ],
  exports: [IngredientRepository, IngredientUsageRepository],
})
export class IngredientRepositoryModule {}
