import { Module } from '@nestjs/common';
import { UpdateTaxService } from './update-tax.service';

@Module({
  providers: [UpdateTaxService],
  exports: [UpdateTaxService],
})
export class UpdateTaxModule {}
