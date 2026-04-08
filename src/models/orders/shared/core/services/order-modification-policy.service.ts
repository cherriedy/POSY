import { Injectable } from '@nestjs/common';
import { Order, OrderItem } from '../../entities';
import { OrderModificationForbiddenException } from '../../exceptions';
import { Role } from '../../../../../common/enums';
import { OrderItemStatus, OrderStatus } from '../../enums';
import { UserIdentity } from '../../../../../authentication/interfaces';

const COOKING_STATUES = [
  OrderItemStatus.PREPARING,
  OrderItemStatus.DONE,
  OrderItemStatus.SERVED,
];

@Injectable()
export class OrderModificationPolicyService {
  /**
   * Asserts whether the provided actor is allowed to modify the given order
   * according to business rules (role restrictions and order status).
   * Throws OrderModificationForbiddenException when modification is disallowed.
   */
  assertOrderModifiable(order: Order, actor?: UserIdentity): void {
    // Completed or canceled orders are immutable.
    if (
      order.status === OrderStatus.COMPLETED ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new OrderModificationForbiddenException(
        'Order cannot be modified after completion or cancellation.',
      );
    }

    // Orders that are ready/serving/served require manager/admin privileges to modify.
    if (
      order.status === OrderStatus.READY ||
      order.status === OrderStatus.SERVING ||
      order.status === OrderStatus.SERVED
    ) {
      if (actor?.role !== Role.MANAGER && actor?.role !== Role.ADMIN) {
        throw new OrderModificationForbiddenException(
          'Only managers or admins can modify orders that are ready, serving, or served.',
        );
      }
    }
  }

  /**
   * Asserts whether the provided items can be removed according to business rules.
   * Only items with 'WAITING' status can be removed without restrictions.
   *
   * @param items {OrderItem[]} - The items proposed for removal
   * @param actor {UserIdentity} - The user attempting the removal, used for policy checks
   * @throws OrderModificationForbiddenException if any item cannot be removed due to its status
   */
  assertItemsRemovable(items: OrderItem[], actor?: UserIdentity): void {
    if (!actor) {
      const nonRemovable = items
        .filter((it) => it.status !== OrderItemStatus.WAITING)
        .map((it) => `${it.id}:${it.status}`);

      if (nonRemovable.length > 0) {
        throw new OrderModificationForbiddenException(
          `Cannot remove items with non-waiting status`,
          nonRemovable,
        );
      }
    }
  }

  /**
   * Asserts whether the provided actor can change the status of an order item to the specified status.
   *
   * @param status {OrderItemStatus} - The new status being assigned to the order item
   * @param user {UserIdentity} - The user attempting the status change
   * @throws OrderModificationForbiddenException if the user is not allowed to set the item to the specified status
   * @throws OrderModificationForbiddenException if the order is not modifiable according to order-level rules
   */
  assertItemModifiable(status: OrderItemStatus, user: UserIdentity): void {
    // If the new status is part of the cooking lifecycle, only kitchen role can set it
    if (COOKING_STATUES.includes(status) && user.role !== Role.KITCHEN) {
      throw new OrderModificationForbiddenException(
        'Only kitchen staff can update cooking-related item statuses.',
      );
    }
  }
}
