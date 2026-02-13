import { TaxConfig } from './tax-config.class';

export class EntityTaxConfig {
  constructor(
    public id: string | null,
    public taxId: string,
    public entityId: string,
    public entityType: string,
    public isActive: boolean = true,
    public note: string | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    // Relations
    public tax: TaxConfig | null,
  ) {}
}
