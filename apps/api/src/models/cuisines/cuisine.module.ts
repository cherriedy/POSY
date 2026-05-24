import { Global, Module } from '@nestjs/common';
import { CuisineController } from './cuisine.controller';
import { CuisineRepository } from '@posy/cuisines/shared/repositories/cuisine-repository.abstract';
import { PrismaCuisineRepository } from '@posy/cuisines/shared/repositories/prisma-cuisine-repository';
import { GetCuisinesService } from '@posy/cuisines/features/get-cuisines/get-cuisines.service';
import { CreateCuisineService } from '@posy/cuisines/features/create-cuisine/create-cuisine.service';
import { UpdateCuisineService } from '@posy/cuisines/features/update-cuisine/update-cuisine.service';
import { DeleteCuisineService } from '@posy/cuisines/features/delete-cuisine/delete-cuisine.service';

@Global()
@Module({
  providers: [
    {
      provide: CuisineRepository,
      useClass: PrismaCuisineRepository,
    },
    GetCuisinesService,
    CreateCuisineService,
    UpdateCuisineService,
    DeleteCuisineService,
  ],
  controllers: [CuisineController],
  exports: [CuisineRepository],
})
export class CuisineModule {}
