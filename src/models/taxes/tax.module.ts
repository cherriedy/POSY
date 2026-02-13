import { Global, Module } from '@nestjs/common';
import {
  TaxRepository,
  TaxRepositoryImpl,
  EntityTaxConfigRepository,
  EntityTaxConfigRepositoryImpl,
} from './repositories';
import { TaxController } from './tax.controller';
import { GetTaxesModule } from './get-taxes/get-taxes.module';
import { CreateTaxModule } from './create-tax/create-tax.module';
import { UpdateTaxModule } from './update-tax/update-tax.module';
import { DeleteTaxModule } from './delete-tax/delete-tax.module';
import { AssociateEntityTaxModule } from './associate-entity-tax/associate-entity-tax.module';
import { GetEntityTaxAssociationsModule } from './get-entity-tax-associations/get-entity-tax-associations.module';
import { UpdateEntityTaxAssociationModule } from './update-entity-tax-association/update-entity-tax-association.module';
import { RemoveEntityTaxAssociationModule } from './remove-entity-tax-association/remove-entity-tax-association.module';

@Global()
@Module({
  providers: [
    {
      provide: TaxRepository,
      useClass: TaxRepositoryImpl,
    },
    {
      provide: EntityTaxConfigRepository,
      useClass: EntityTaxConfigRepositoryImpl,
    },
  ],
  imports: [
    GetTaxesModule,
    CreateTaxModule,
    UpdateTaxModule,
    DeleteTaxModule,
    AssociateEntityTaxModule,
    GetEntityTaxAssociationsModule,
    UpdateEntityTaxAssociationModule,
    RemoveEntityTaxAssociationModule,
  ],
  controllers: [TaxController],
  exports: [
    TaxRepository,
    GetTaxesModule,
    CreateTaxModule,
    UpdateTaxModule,
    DeleteTaxModule,
    EntityTaxConfigRepository,
    AssociateEntityTaxModule,
    GetEntityTaxAssociationsModule,
    UpdateEntityTaxAssociationModule,
    RemoveEntityTaxAssociationModule,
  ],
})
export class TaxModule {}
