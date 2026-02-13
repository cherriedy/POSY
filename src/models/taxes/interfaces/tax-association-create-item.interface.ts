import { EntityType } from '../enums';

/**
 * Represents an item for creating a new tax association.
 *
 * @property {string} entityId - The unique identifier of the entity to associate with the tax.
 * @property {EntityType} entityType - The type of the entity being associated with the tax.
 * @property {boolean} [isActive] - Optional. Indicates whether the tax association is active upon creation.
 * @property {string} [note] - Optional. Additional notes or comments about the tax association.
 */
export interface TaxAssociationCreateItem {
  entityId: string;
  entityType: EntityType;
  isActive?: boolean;
  note?: string;
}
