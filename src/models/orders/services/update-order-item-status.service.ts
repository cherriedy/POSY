import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { OrderItemStatusService } from '../shared/core/services/order-item-status.service';
import { StaffOrderGateway } from '../handlers/staff-order.gateway';
import { GuestOrderGateway } from '../handlers/guest-order.gateway';
import { UpdateOrderItemStatusDto } from '../shared/dto/update-order-item-status.dto';
import { Order, OrderItemStatus } from '../shared';
import { UnsupportedValueException } from '../../../common/exceptions';
import { Role } from '../../../common/enums';
import { JwtPayload, UserIdentity } from '../../../authentication/interfaces';

@Injectable()
export class UpdateOrderItemStatusService {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;

  constructor(
    private readonly orderItemStatusService: OrderItemStatusService,
    private readonly staffOrderGateway: StaffOrderGateway,
    private readonly guestOrderGateway: GuestOrderGateway,
  ) {}

  /**
   * Updates the status of a specific order item and broadcasts the update to staff and guests.
   *
   * @param payload {UpdateOrderItemStatusPayload} - The payload containing the order ID, item ID, new status, and optional note.
   * @returns {Promise<Order>} - The updated order after the item status has been changed.
   * @throws {UnsupportedValueException} - If the provided status in the DTO is not a valid OrderItemStatus.
   *
   * @note The flow of this method is as follows:
   * 1. Validate the new status value from the DTO to ensure it is a valid {@link OrderItemStatus}.
   * 2. Call the {@link OrderItemStatusService} to update the status of the specified order item.
   * 3. Emit the updated order information to staff via the {@link StaffOrderGateway}.
   * 4. Emit the updated order information to guests via the {@link GuestOrderGateway}.
   * 5. Handle any exceptions that occur during broadcasting and log them appropriately.
   */
  async execute(payload: UpdateOrderItemStatusPayload): Promise<Order> {
    const updated = await this.orderItemStatusService.execute({
      orderId: payload.orderId,
      itemId: payload.item.id,
      status: payload.item.status,
      note: payload.item.note,
      user: payload.user,
    });

    try {
      this.staffOrderGateway.emitOrderUpdated(updated.id!);
    } catch (e) {
      this.logger.error(
        `Failed to broadcast order update to StaffOrderGateway for order ${updated.id}`,
        e instanceof Error ? e.stack : e,
      );
    }

    try {
      this.guestOrderGateway.emitOrderUpdated(updated.tableId, updated.id!);
    } catch (e) {
      this.logger.error(
        `Failed to broadcast order update to GuestOrderGateway for order ${updated.id}`,
        e instanceof Error ? e.stack : e,
      );
    }

    return updated;
  }
}

/**
 * Defines the payload structure for updating the status of an order item, including
 * validation of the status value. This payload is used internally to ensure that
 * the data passed to the service
 */
export type UpdateOrderItemStatusPayload = {
  orderId: string;
  item: {
    id: string;
    status: OrderItemStatus;
    note?: string | null;
  };
  user?: UserIdentity;
};

/**
 * Maps the {@link UpdateOrderItemStatusDto} to {@link UpdateOrderItemStatusPayload}, validating the status value.
 *
 * @param orderId {string} - The ID of the order.
 * @param itemId {string} - The ID of the order item.
 * @param dto {UpdateOrderItemStatusDto} - The DTO containing the new status and optional note.
 * @param jwtPayload {JwtPayload} - The JWT payload containing user information, used for authorization checks.
 * @returns {UpdateOrderItemStatusPayload} - The mapped payload ready for processing.
 * @throws {UnsupportedValueException} - If the provided status is not a valid OrderItemStatus.
 */
export function toPayload(
  orderId: string,
  itemId: string,
  dto: UpdateOrderItemStatusDto,
  jwtPayload?: JwtPayload,
): UpdateOrderItemStatusPayload {
  if (!Object.values(OrderItemStatus).includes(dto.status)) {
    throw new UnsupportedValueException(
      dto.status,
      `Status is supposed to be one of: ${Object.values(OrderItemStatus).join(', ')}`,
    );
  }

  return {
    orderId,
    item: {
      id: itemId,
      status: dto.status,
      note: dto.note,
    },
    user: jwtPayload
      ? {
          id: jwtPayload.sub,
          role: jwtPayload.role as Role,
        }
      : undefined,
  };
}
