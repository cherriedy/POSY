import { Module } from '@nestjs/common';
import { ProductInteractionService } from '@posy/user-tracking/features/product-interaction.service';
import { RedisModule } from '@posy/shared';
import { SessionProductInteractionRepository } from '@posy/user-tracking/shared/repositories/session-product-interaction-repository.abstract';
import { SessionProductInteractionRepositoryImpl } from '@posy/user-tracking/shared/repositories/prisma-session-product-interaction-repository';

@Module({
  imports: [RedisModule],
  providers: [
    ProductInteractionService,
    { provide: SessionProductInteractionRepository, useClass: SessionProductInteractionRepositoryImpl },
  ],
  exports: [ProductInteractionService],
})
export class UserTrackingModule {}
