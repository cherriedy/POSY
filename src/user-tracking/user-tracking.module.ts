import { Module } from '@nestjs/common';
import { ProductInteractionService } from './features/product-interaction.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RedisModule } from '../providers/redis';
import { SpiRepositoryModule } from './shared/repositories/spi-repository.module';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
    RedisModule,
    SpiRepositoryModule,
  ],
  providers: [ProductInteractionService],
  exports: [ProductInteractionService],
})
export class UserTrackingModule {}
