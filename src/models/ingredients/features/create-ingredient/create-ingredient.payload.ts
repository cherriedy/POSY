export interface CreateIngredientPayload {
  vendorId: string;
  unitId: string;
  name: string;
  stock: number;
  minStock: number;
  unitCost: number;
  expiredAt?: Date | null;
}
