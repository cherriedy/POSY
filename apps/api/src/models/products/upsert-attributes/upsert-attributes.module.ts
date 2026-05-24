import { Module } from '@nestjs/common';
import { UpsertAttributesService } from './upsert-attributes.service';
import { IngredientRepositoryModule } from '../../ingredients/shared/repositories/ingredient-repository.module';

@Module({
  imports: [IngredientRepositoryModule],
  providers: [UpsertAttributesService],
  exports: [UpsertAttributesService],
})
export class UpsertAttributesModule {}
