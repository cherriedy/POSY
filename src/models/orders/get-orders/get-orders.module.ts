import { Module } from '@nestjs/common';
import { GetOrdersService } from './get-orders.service';

@Module({
  providers: [GetOrdersService],
  exports: [GetOrdersService],
})
export class GetOrdersModule {}
