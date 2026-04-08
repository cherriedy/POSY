import { Global, Module } from '@nestjs/common';
import { IngredientController } from './ingredient.controller';
import { CreateIngredientModule } from './features/create-ingredient';
import { UpdateIngredientModule } from './features/update-ingredient';
import { GetIngredientsModule } from './features/get-ingredients';
import { DeleteIngredientModule } from './features/delete-ingredient';
import { UnitModule } from '../units';
import { VendorModule } from '../vendors';
import { RecordIngredientUsageModule } from './features/record-ingredient-usage';
import { IngredientRepositoryModule } from './shared/repositories/ingredient-repository.module';

@Global()
@Module({
  imports: [
    IngredientRepositoryModule,
    CreateIngredientModule,
    UpdateIngredientModule,
    GetIngredientsModule,
    DeleteIngredientModule,
    UnitModule,
    VendorModule,
    RecordIngredientUsageModule,
  ],
  controllers: [IngredientController],
  exports: [IngredientRepositoryModule],
})
export class IngredientModule {}
