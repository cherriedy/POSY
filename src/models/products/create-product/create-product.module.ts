import { Module } from '@nestjs/common';
import { CreateProductService } from './create-product.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
    }),
  ],
  providers: [CreateProductService],
  exports: [CreateProductService],
})
export class CreateProductModule {}
