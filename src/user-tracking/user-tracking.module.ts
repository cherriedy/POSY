import { Module } from '@nestjs/common';
import { ProductInteractionService } from './features/product-interaction.service';
import { RedisModule } from '../providers/redis/redis.module';
import { SpiRepositoryModule } from './shared/repositories/session-product-interaction-repository.module';

@Module({
  imports: [RedisModule, SpiRepositoryModule],
  providers: [ProductInteractionService],
  exports: [ProductInteractionService],
})
export class UserTrackingModule {}
