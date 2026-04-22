import { Module } from '@nestjs/common';import { GetAvailablePromotionsService } from './get-available-promotions.service';
;

@Module({
  providers: [GetAvailablePromotionsService],
  exports: [GetAvailablePromotionsService],
})
export class GetAvailablePromotionsModule {}
