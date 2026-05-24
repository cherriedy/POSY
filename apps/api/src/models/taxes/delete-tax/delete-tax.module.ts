import { Module } from '@nestjs/common';
import { DeleteTaxService } from './delete-tax.service';

@Module({
  providers: [DeleteTaxService],
  exports: [DeleteTaxService],
})
export class DeleteTaxModule {}
