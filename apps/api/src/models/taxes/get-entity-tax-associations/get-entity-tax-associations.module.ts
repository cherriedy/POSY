import { Module } from '@nestjs/common';
import { GetEntityTaxAssociationsService } from './get-entity-tax-associations.service';

@Module({
  providers: [GetEntityTaxAssociationsService],
  exports: [GetEntityTaxAssociationsService],
})
export class GetEntityTaxAssociationsModule {}
