import { Unit } from '../../../units';
import { Vendor } from '../../../vendors';

export class Ingredient {
  constructor(
    public id: string | null = null,
    public vendorId: string,
    public unitId: string,
    public name: string,
    public stock: number,
    public minStock: number,
    public unitCost: number,
    public expiredAt: Date | null = null,
    public createdAt: Date | null = null,
    public updatedAt: Date | null = null,
    // Relations
    public vendor: Vendor | null = null,
    public unit: Unit | null = null,
  ) {}
}
