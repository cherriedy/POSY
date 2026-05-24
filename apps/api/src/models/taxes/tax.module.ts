import { Global, Module } from '@nestjs/common';
import { TaxRepository } from './repositories/tax-repository.abstract';
import { TaxRepositoryImpl } from './repositories/tax-repository';
import { EntityTaxConfigRepository } from './repositories/entity-tax-config-repository.abstract';
import { EntityTaxConfigRepositoryImpl } from './repositories/entity-tax-config-repository';
import { OrderTaxRepository } from './repositories/order-tax-repository.abstract';
import { OrderTaxRepositoryImpl } from './repositories/order-tax-repository';
import { PricingSnapshotTaxRepository } from './repositories/pricing-snapshot-tax-repository.abstract';
import { PricingSnapshotTaxRepositoryImpl } from './repositories/pricing-snapshot-tax-repository';
import { TaxController } from './tax.controller';
import { GetTaxesModule } from './get-taxes/get-taxes.module';
import { CreateTaxModule } from './create-tax/create-tax.module';
import { UpdateTaxModule } from './update-tax/update-tax.module';
import { DeleteTaxModule } from './delete-tax/delete-tax.module';
import { AssociateEntityTaxModule } from './associate-entity-tax/associate-entity-tax.module';
import { GetEntityTaxAssociationsModule } from './get-entity-tax-associations/get-entity-tax-associations.module';
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
