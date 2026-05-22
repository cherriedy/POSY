import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Order } from '../shared/entities/order';
import { OrderNotFoundException } from '../shared/exceptions/order-not-found.exception';
import { OrderStatus } from '../shared/enums/order-status.enum';
import { OrderModificationPolicyService } from '../shared/core/services/order-modification-policy.service';
import { StaffOrderGateway } from '../handlers/staff-order.gateway';
import { GuestOrderGateway } from '../handlers/guest-order.gateway';
import { TableSessionRepository } from '../../table-sessions/shared/repositories/table-session-repository.abstract';
import { TableSessionStatus } from '../../table-sessions/shared/enums/table-session-status.enum';
import { TableSessionType } from '../../table-sessions/shared/enums/table-session-type.enum';
import { OrderRepository } from '../shared/repositories/order-repository.abstract';
import { UserIdentity } from '../../../authentication/interfaces/user-identity.interface';
import { UpdateOrderStatusDto } from '../shared/dto/update-order-status.dto';
import { UnsupportedValueException } from '../../../common/exceptions/unsupported-value.exception';
import { TableRepository } from 'src/models/tables/repositories/table.repository-abstract';
import { TableStatus } from 'src/models/tables/enums/table-status.enum';

@Injectable()
export class UpdateOrderStatusService {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly tableSessionRepository: TableSessionRepository,
    private readonly policyService: OrderModificationPolicyService,
    private readonly staffOrderGateway: StaffOrderGateway,
    private readonly guestOrderGateway: GuestOrderGateway,
    private readonly tableRepository: TableRepository,
  ) {}

  /**
   * Updates the status of an order and broadcasts the update to staff and guests.
   * The order can only be updated if it passes the policy checks defined in
   * {@link OrderModificationPolicyService}.
   *
   * @param {UpdateOrderStatusPayload} payload - The payload containing the order ID, new status, and optional note.
   * @return {Promise<Order>} The updated order.
   * @throws {OrderNotFoundException} If the order does not exist.
   * @throws {OrderModificationForbiddenException} If the order cannot be modified according to policy.
   */
  async execute(payload: UpdateOrderStatusPayload): Promise<Order> {
    const orderId = payload.order.id;
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new OrderNotFoundException(orderId);
    const table = await this.tableRepository.findById(order.tableId);

    // Check if the order can be modified according to the policy service
    this.policyService.assertOrderModifiable(order, payload.user);

    const updated = await this.orderRepository.update(orderId, {
      status: payload.order.status,
      note: payload.order.note,
    });

    // If order is COMPLETED or CANCELLED → end session
    const shouldEndSession =
      payload.order.status === OrderStatus.COMPLETED ||
      payload.order.status === OrderStatus.CANCELLED;

    if (shouldEndSession) {
      const session = await this.tableSessionRepository.findActiveByTableId(
        order.tableId,
      );

      if (session) {
        await this.tableSessionRepository.endSession(session.id!);
      }

      if (table!.status == TableStatus.OCCUPIED) {
        await this.tableRepository.update(order.tableId, {
          status: TableStatus.AVAILABLE,
        });
      }
    }

    // Broadcast to staff
    try {
      this.staffOrderGateway.emitOrderUpdated(updated.id!);
    } catch (e) {
      this.logger.error(
        `Failed to broadcast order update to staff for order ${updated.id}`,
        e instanceof Error ? e.stack : e,
      );
    }

    // Broadcast to guests if the corresponding table session is active and of type GUEST
    try {
      const session = await this.tableSessionRepository.findActiveByTableId(
        updated.tableId,
      );
      if (!session || session.status !== TableSessionStatus.ACTIVE) {
        this.logger.warn(
          `No active session found for table ${updated.tableId}. 
          Skipping guest notification for order ${updated.id}.`,
        );
      } else {
        if (session.sessionType == TableSessionType.GUEST) {
          this.guestOrderGateway.emitOrderUpdated(updated.tableId, updated.id!);
        }
      }
    } catch (e) {
      this.logger.error(
        `Failed to broadcast order update to guests for order ${updated.id}`,
        e instanceof Error ? e.stack : e,
      );
    }

    return updated;
  }
}

/**
 * Defines the payload structure for updating the status of an order, including
 * validation of the status value. This payload is used internally to ensure that
 * the data passed to the service is well-formed and contains valid status values.
 */
export type UpdateOrderStatusPayload = {
  user: UserIdentity;
  order: {
    id: string;
    status: OrderStatus;
    note?: string | null;
  };
};
/**
 * Maps the {@link UpdateOrderStatusDto} to {@link UpdateOrderStatusPayload}, validating the status value.
 *
 * @param user - The user performing the update.
 * @param orderId - The ID of the order.
 * @param dto - The DTO containing the new status and optional note.
 * @returns The mapped payload ready for processing.
 * @throws {UnsupportedValueException} If the provided status is not a valid OrderStatus.
 */
export function toPayload(
  user: { sub: string; role: string },
  orderId: string,
  dto: UpdateOrderStatusDto,
): UpdateOrderStatusPayload {
  if (!Object.values(OrderStatus).includes(dto.status)) {
    throw new UnsupportedValueException(
      dto.status,
      `Status is supposed to be one of: ${Object.values(OrderStatus).join(', ')}`,
    );
  }

  return {
    user: {
      id: user.sub,
      role: user.role,
    } as UserIdentity,
    order: {
      id: orderId,
      status: dto.status,
      note: dto.note ?? undefined,
    },
  };
}
