import { Global, Module } from '@nestjs/common';
import { IngredientController } from './ingredient.controller';
import { IngredientRepository, IngredientRepositoryImpl } from './repositories';
import { CreateIngredientModule } from './create-ingredient';
import { UpdateIngredientModule } from './update-ingredient';
import { GetIngredientsModule } from './get-ingredients';
import { DeleteIngredientModule } from './delete-ingredient';

@Global()
@Module({
  providers: [
    {
      provide: IngredientRepository,
      useClass: IngredientRepositoryImpl,
    },
  ],
  exports: [IngredientRepository],
  imports: [
    CreateIngredientModule,
    UpdateIngredientModule,
    GetIngredientsModule,
    DeleteIngredientModule,
  ],
  controllers: [IngredientController],
})
export class IngredientModule {}
