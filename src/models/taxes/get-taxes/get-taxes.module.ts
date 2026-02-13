import { Module } from '@nestjs/common';
import { GetTaxesService } from './get-taxes.service';

@Module({
  providers: [GetTaxesService],
  exports: [GetTaxesService],
})
export class GetTaxesModule {}
