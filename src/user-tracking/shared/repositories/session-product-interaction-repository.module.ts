import { Module } from '@nestjs/common';
import { SessionProductInteractionRepository } from './session-product-interaction-repository.abstract';
import { SessionProductInteractionRepositoryImpl } from './prisma-session-product-interaction-repository';

@Module({
  providers: [
    {
      provide: SessionProductInteractionRepository,
      useClass: SessionProductInteractionRepositoryImpl,
    },
  ],
  exports: [SessionProductInteractionRepository],
})
export class SpiRepositoryModule {}
