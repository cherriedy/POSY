import { Module } from '@nestjs/common';
import { ProductInteractionService } from './features/product-interaction.service';
import { RedisModule } from '../providers/redis';
import { SpiRepositoryModule } from './shared/repositories/spi-repository.module';

@Module({
  imports: [RedisModule, SpiRepositoryModule],
  providers: [ProductInteractionService],
  exports: [ProductInteractionService],
})
export class UserTrackingModule {}
