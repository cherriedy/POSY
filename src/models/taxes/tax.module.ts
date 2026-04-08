import { Global, Module } from '@nestjs/common';
import {
  TaxRepository,
  TaxRepositoryImpl,
  EntityTaxConfigRepository,
  EntityTaxConfigRepositoryImpl,
  OrderTaxRepository,
  OrderTaxRepositoryImpl,
  PricingSnapshotTaxRepository,
  PricingSnapshotTaxRepositoryImpl,
} from './repositories';
import { TaxController } from './tax.controller';
import { GetTaxesModule } from './get-taxes';
import { CreateTaxModule } from './create-tax';
import { UpdateTaxModule } from './update-tax';
import { DeleteTaxModule } from './delete-tax';
import { AssociateEntityTaxModule } from './associate-entity-tax';
import { GetEntityTaxAssociationsModule } from './get-entity-tax-associations';
import { RemoveEntityTaxAssociationModule } from './remove-entity-tax-association';

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
    {
      provide: OrderTaxRepository,
      useClass: OrderTaxRepositoryImpl,
    },
    {
      provide: PricingSnapshotTaxRepository,
      useClass: PricingSnapshotTaxRepositoryImpl,
    },
  ],
  imports: [
    GetTaxesModule,
    CreateTaxModule,
    UpdateTaxModule,
    DeleteTaxModule,
    AssociateEntityTaxModule,
    GetEntityTaxAssociationsModule,
    RemoveEntityTaxAssociationModule,
  ],
  controllers: [TaxController],
  exports: [
    TaxRepository,
    EntityTaxConfigRepository,
    OrderTaxRepository,
    PricingSnapshotTaxRepository,
  ],
})
export class TaxModule {}
