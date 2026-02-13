/**
 * Represents an item for updating a tax association.
 *
 * @property {string} id - The unique identifier of the tax association item to update.
 * @property {boolean} [isActive] - Optional. Indicates whether the tax association is active. If omitted, the active status will not be changed.
 * @property {string} [note] - Optional. Additional notes or comments about the tax association update.
 */
export interface TaxAssociationUpdateItem {
  id: string;
  isActive?: boolean;
  note?: string;
}
