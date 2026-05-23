import { Global, Module } from '@nestjs/common';
import { CuisineController } from './cuisine.controller';
import { CuisineRepository } from './repositories/cuisine-repository.abstract';
import { PrismaCuisineRepository } from './repositories/prisma-cuisine-repository';
import { GetCuisinesModule } from './get-cuisines/get-cuisines.module';
import { CreateCuisineModule } from './create-cuisine/create-cuisine.module';
import { UpdateCuisineModule } from './update-cuisine/update-cuisine.module';
import { DeleteCuisineModule } from './delete-cuisine/delete-cuisine.module';

@Global()
@Module({
  providers: [
    {
      provide: CuisineRepository,
      useClass: PrismaCuisineRepository,
    },
  ],
  imports: [
    GetCuisinesModule,
    CreateCuisineModule,
    UpdateCuisineModule,
    DeleteCuisineModule,
  ],
  controllers: [CuisineController],
  exports: [CuisineRepository],
})
export class CuisineModule {}
