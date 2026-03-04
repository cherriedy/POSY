import { Global, Module } from '@nestjs/common';
import { IngredientController } from './ingredient.controller';
import { IngredientRepository, IngredientRepositoryImpl } from './repositories';
import { CreateIngredientModule } from './create-ingredient';
import { UpdateIngredientModule } from './update-ingredient';
import { GetIngredientsModule } from './get-ingredients';
import { DeleteIngredientModule } from './delete-ingredient';
import { UnitModule } from '../units';
import { VendorModule } from '../vendors';

@Global()
@Module({
  providers: [
    { provide: IngredientRepository, useClass: IngredientRepositoryImpl },
  ],
  exports: [IngredientRepository],
  imports: [
    CreateIngredientModule,
    UpdateIngredientModule,
    GetIngredientsModule,
    DeleteIngredientModule,
    UnitModule,
    VendorModule,
  ],
  controllers: [IngredientController],
})
export class IngredientModule {}
