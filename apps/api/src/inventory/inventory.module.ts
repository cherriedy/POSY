import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { IngredientForecastService } from '@posy/inventory/features/ingredient-forecast.service';
import { IngredientForecastRepository } from '@posy/inventory/shared/repositories/ingredient-forecast-repository.abstract';
import { PrismaIngredientForecastRepository } from '@posy/inventory/shared/repositories/prisma-ingredient-forecast-repository';
import { HttpModule } from '@nestjs/axios';
import { PythonConfigModule } from '@posy/shared';

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
      useClass: PrismaIngredientForecastRepository,
    },
  ],
})
export class InventoryModule {}
