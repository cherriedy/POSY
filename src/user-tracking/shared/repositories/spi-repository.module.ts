import { Module } from '@nestjs/common';
import { SessionProductInteractionRepository } from './spi-repository.abstract';
import { SessionProductInteractionRepositoryImpl } from './spi-repository';

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
