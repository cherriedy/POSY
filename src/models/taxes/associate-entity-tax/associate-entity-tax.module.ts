import { Module } from '@nestjs/common';
import { AssociateEntityTaxService } from './associate-entity-tax.service';

@Module({
  providers: [AssociateEntityTaxService],
  exports: [AssociateEntityTaxService],
})
export class AssociateEntityTaxModule {}
