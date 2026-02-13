import { Module } from '@nestjs/common';
import { UpdateEntityTaxAssociationService } from './update-entity-tax-association.service';

@Module({
  providers: [UpdateEntityTaxAssociationService],
  exports: [UpdateEntityTaxAssociationService],
})
export class UpdateEntityTaxAssociationModule {}
