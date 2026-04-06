import { OrderItemStatus, OrderStatus } from '../enums';

/**
 * Computes the aggregate {@link OrderStatus} based on a collection of {@link OrderItemStatus} values.
 *
 * @param itemStatuses - An array of statuses for individual items within an order.
 * @returns The calculated overall status of the order based on the following priority rules:
 * 1. **PENDING**: If the list is empty or contains no valid statuses.
 * 2. **CANCELLED**: If every item in the list is canceled.
 * 3. **SERVED**: If all non-canceled items have been served.
 * 4. **SERVING**: If at least one item is currently being served.
 * 5. **PREPARING**: If at least one item is currently being prepared.
 * 6. **READY**: If at least one item is done (maps item-level `DONE` to order-level `READY`).
 * 7. **PENDING**: Default fallback for all other cases.
 *
 * @note Item-level `DONE` is mapped to order-level `READY`.
 */
export function computeOrderStatus(
  itemStatuses: readonly OrderItemStatus[],
): OrderStatus {
  // If there are no item statuses, the order is PENDING
  if (!itemStatuses || itemStatuses.length === 0) return OrderStatus.PENDING;

  // If there is no valid status, treat as PENDING
  const statuses = itemStatuses.filter(Boolean);
  if (!statuses.length) return OrderStatus.PENDING;

  const statusSet = new Set(statuses); // Unique set of item statuses for efficient checks

  // If all items are CANCELED, the order is CANCELED
  if ([...statusSet].every((s) => s === OrderItemStatus.CANCELLED)) {
    return OrderStatus.CANCELLED;
  }

  // If all items are WAITING, the order is PENDING
  if ([...statusSet].every((s) => s === OrderItemStatus.WAITING)) {
    return OrderStatus.PENDING;
  }

  // If all NON-CANCELED items are served, the order is served
  const allNonCancelledServed = statuses
    .filter((s) => s !== OrderItemStatus.CANCELLED)
    .every((s) => s === OrderItemStatus.SERVED);
  if (allNonCancelledServed) return OrderStatus.SERVED;

  // If any item is serving, the order is SERVING
  if (statusSet.has(OrderItemStatus.SERVING)) return OrderStatus.SERVING;

  // If any item is preparing, the order is PREPARING
  if (statusSet.has(OrderItemStatus.PREPARING)) return OrderStatus.PREPARING;

  // If any item is done, the order is READY
  if (statusSet.has(OrderItemStatus.DONE)) return OrderStatus.READY;

  // Fallback to pending for any other combination of statuses
  return OrderStatus.PENDING;
}
