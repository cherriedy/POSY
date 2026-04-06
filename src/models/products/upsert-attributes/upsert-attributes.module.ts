import { Module } from '@nestjs/common';
import { UpsertAttributesService } from './upsert-attributes.service';
import { IngredientRepositoryModule } from '../../ingredients/shared/repositories/ingredient-repository.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
    IngredientRepositoryModule,
  ],
  providers: [UpsertAttributesService],
  exports: [UpsertAttributesService],
})
export class UpsertAttributesModule {}
