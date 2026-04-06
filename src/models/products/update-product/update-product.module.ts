import { Module } from '@nestjs/common';
import { UpdateProductService } from './update-product.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
  ],
  providers: [UpdateProductService],
  exports: [UpdateProductService],
})
export class UpdateProductModule {}
