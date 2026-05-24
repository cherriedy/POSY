import { Global, Module } from '@nestjs/common';
import { TaxRepository } from '@posy/taxes/shared/repositories/tax-repository.abstract';
import { TaxRepositoryImpl } from '@posy/taxes/shared/repositories/tax-repository';
import { EntityTaxConfigRepository } from '@posy/taxes/shared/repositories/entity-tax-config-repository.abstract';
import { EntityTaxConfigRepositoryImpl } from '@posy/taxes/shared/repositories/entity-tax-config-repository';
import { OrderTaxRepository } from '@posy/taxes/shared/repositories/order-tax-repository.abstract';
import { OrderTaxRepositoryImpl } from '@posy/taxes/shared/repositories/order-tax-repository';
import { PricingSnapshotTaxRepository } from '@posy/taxes/shared/repositories/pricing-snapshot-tax-repository.abstract';
import { PricingSnapshotTaxRepositoryImpl } from '@posy/taxes/shared/repositories/pricing-snapshot-tax-repository';
import { TaxController } from './tax.controller';
import { GetTaxesService } from '@posy/taxes/features/get-taxes/get-taxes.service';
import { CreateTaxService } from '@posy/taxes/features/create-tax/create-tax.service';
import { UpdateTaxService } from '@posy/taxes/features/update-tax/update-tax.service';
import { DeleteTaxService } from '@posy/taxes/features/delete-tax/delete-tax.service';
import { AssociateEntityTaxService } from '@posy/taxes/features/associate-entity-tax/associate-entity-tax.service';
import { GetEntityTaxAssociationsService } from '@posy/taxes/features/get-entity-tax-associations/get-entity-tax-associations.service';
import { RemoveEntityTaxAssociationService } from '@posy/taxes/features/remove-entity-tax-association/remove-entity-tax-association.service';

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
    GetTaxesService,
    CreateTaxService,
    UpdateTaxService,
    DeleteTaxService,
    AssociateEntityTaxService,
    GetEntityTaxAssociationsService,
    RemoveEntityTaxAssociationService,
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
