import { Global, Module } from '@nestjs/common';
import { IngredientController } from './ingredient.controller';
import { CreateIngredientModule } from '@posy/ingredients/features/create-ingredient/create-ingredient.module';
import { UpdateIngredientModule } from '@posy/ingredients/features/update-ingredient/update-ingredient.module';
import { GetIngredientsModule } from '@posy/ingredients/features/get-ingredients/get-ingredients.module';
import { DeleteIngredientModule } from '@posy/ingredients/features/delete-ingredient/delete-ingredient.module';
import { RecordIngredientUsageModule } from '@posy/ingredients/features/record-ingredient-usage/record-ingredient-usage.module';
import { IngredientRepository } from '@posy/ingredients/shared/repositories/ingredient-repository.abstract';
import { PrismaIngredientRepository } from '@posy/ingredients/shared/repositories/prisma-ingredient-repository';
import { IngredientUsageRepository } from '@posy/ingredients/shared/repositories/ingredient-usage-repository.abstract';
import { PrismaIngredientUsageRepository } from '@posy/ingredients/shared/repositories/prisma-ingredient-usage-repository';

@Global()
@Module({
  imports: [
    CreateIngredientModule,
    UpdateIngredientModule,
    GetIngredientsModule,
    DeleteIngredientModule,
    RecordIngredientUsageModule,
  ],
  providers: [
    { provide: IngredientRepository, useClass: PrismaIngredientRepository },
    {
      provide: IngredientUsageRepository,
      useClass: PrismaIngredientUsageRepository,
    },
  ],
  controllers: [IngredientController],
  exports: [IngredientRepository, IngredientUsageRepository],
})
export class IngredientModule {}
