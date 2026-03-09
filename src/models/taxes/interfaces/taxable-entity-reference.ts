import { EntityType } from '../enums';

/**
 * Reference to an entity associated with a tax configuration, including its ID and type.
 */
export interface TaxableEntityReference {
  id: string;
  type: EntityType;
}
