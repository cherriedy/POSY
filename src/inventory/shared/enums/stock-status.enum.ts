/**
 * Enum representing the stock status of an inventory item.
 * - SAFE: Current stock is sufficient to meet predicted usage.
 * - WARNING: Current stock is close to predicted usage, may require attention.
 * - DANGER: Current stock is insufficient to meet predicted usage, action needed.
 */
export enum StockStatus {
  SAFE = 'SAFE',
  DANGER = 'DANGER',
  WARNING = 'WARNING',
}
