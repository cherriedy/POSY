import { Module } from '@nestjs/common';
import { CreateTaxService } from './create-tax.service';

@Module({
  providers: [CreateTaxService],
  exports: [CreateTaxService],
})
export class CreateTaxModule {}
