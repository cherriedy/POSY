import { Global, Module } from '@nestjs/common';
import { CuisineController } from './cuisine.controller';
import { CuisineRepository, CuisineRepositoryImpl } from './repositories';
import { GetCuisinesModule } from './get-cuisines/get-cuisines.module';
import { CreateCuisineModule } from './create-cuisine/create-cuisine.module';
import { UpdateCuisineModule } from './update-cuisine/update-cuisine.module';
import { DeleteCuisineModule } from './delete-cuisine/delete-cuisine.module';

@Global()
@Module({
  providers: [
    {
      provide: CuisineRepository,
      useClass: CuisineRepositoryImpl,
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
