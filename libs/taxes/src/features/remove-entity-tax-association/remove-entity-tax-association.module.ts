import { Module } from '@nestjs/common';
import { RemoveEntityTaxAssociationService } from './remove-entity-tax-association.service';

@Module({
  providers: [RemoveEntityTaxAssociationService],
  exports: [RemoveEntityTaxAssociationService],
})
export class RemoveEntityTaxAssociationModule {}
