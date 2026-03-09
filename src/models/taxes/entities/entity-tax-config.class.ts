import { TaxConfig } from './tax-config.class';

export class EntityTaxConfig {
  constructor(
    public id: string | undefined,
    public taxId: string,
    public entityId: string,
    public entityType: string,
    public isActive: boolean = true,
    public note: string | null = null,
    public createdAt?: Date,
    public updatedAt?: Date,
    // Relations
    public tax?: TaxConfig,
  ) {}
}
