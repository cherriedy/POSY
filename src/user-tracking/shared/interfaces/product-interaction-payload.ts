import { ProductInteractionType } from '../enums';

/**
 * @description Interface representing the payload of a product interaction message.
 *
 * @property {string} sessionId - The unique identifier for the user session.
 * @property {string} productId - The unique identifier for the product.
 * @property {ProductInteractionType} type - The type of interaction.
 * @property {number} [quantity] - The quantity of the product involved in the interaction (optional).
 * @property {number} [price] - The price of the product at the time of interaction (optional).
 * @property {Date | string} [timestamp] - The timestamp of when the interaction occurred (optional).
 */
export interface ProductInteractionPayload {
  sessionId: string;
  productId: string;
  type: ProductInteractionType;
  quantity?: number;
  price?: number;
  timestamp?: Date | string;
}
