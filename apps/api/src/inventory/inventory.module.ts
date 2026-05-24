import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { IngredientForecastService } from './features/ingredient-forecast.service';
import { IngredientForecastRepository } from './shared/repositories/ingredient-forecast-repository.abstract';
import { IngredientForecastRepositoryImpl } from './shared/repositories/ingredient-forecast-repository';
import { HttpModule } from '@nestjs/axios';
import { PythonConfigModule } from '../config/python/config.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    PythonConfigModule,
  ],
  controllers: [InventoryController],
  providers: [
    IngredientForecastService,
    {
      provide: IngredientForecastRepository,
      useClass: IngredientForecastRepositoryImpl,
    },
  ],
})
export class InventoryModule {}
