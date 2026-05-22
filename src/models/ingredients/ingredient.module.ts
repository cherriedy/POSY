import { Global, Module } from '@nestjs/common';
import { IngredientController } from './ingredient.controller';
import { CreateIngredientModule } from './features/create-ingredient/create-ingredient.module';
import { UpdateIngredientModule } from './features/update-ingredient/update-ingredient.module';
import { GetIngredientsModule } from './features/get-ingredients/get-ingredients.module';
import { DeleteIngredientModule } from './features/delete-ingredient/delete-ingredient.module';
import { RecordIngredientUsageModule } from './features/record-ingredient-usage/record-ingredient-usage.module';
import { IngredientRepositoryModule } from './shared/repositories/ingredient-repository.module';

@Global()
@Module({
  imports: [
    IngredientRepositoryModule,
    CreateIngredientModule,
    UpdateIngredientModule,
    GetIngredientsModule,
    DeleteIngredientModule,
    RecordIngredientUsageModule,
  ],
  controllers: [IngredientController],
  exports: [IngredientRepositoryModule],
})
export class IngredientModule {}
