import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { GetOrdersService } from './get-orders.service';
import { CreateOrderService, CreateOrderPayload } from './create-order.service';
import { RecommendationService } from '../../../recommendation/recommendation.service';
import { OrderDetailedResponseDto } from '../shared';

@Injectable()
export class OrderFacadeService {
  constructor(
    private readonly getOrdersService: GetOrdersService,
    private readonly createOrderService: CreateOrderService,
    private readonly recommendationService: RecommendationService,
  ) {}

  /**
   * Fetches an order by session ID, then retrieves personalized product recommendations
   * based on the order's items.
   *
   * @param sessionId {string} - The UUID of the session associated with the order.
   * @returns An object containing the order details and personalized product recommendations.
   */
  async getOrderWithRecommendations(sessionId: string) {
    const order = await this.getOrdersService.getBySessionId(sessionId);

    const orderDto = plainToInstance(OrderDetailedResponseDto, order, {
      excludeExtraneousValues: true,
    });

    const productIds = (order.orderItems ?? []).map((item) => item.productId);
    const recommendations =
      await this.recommendationService.getPersonalizedRecommendations(
        sessionId,
        productIds,
      );

    return { ...orderDto, recommendations };
  }

  /**
   * Creates a new order based on the provided payload, then retrieves personalized product recommendations
   * based on the order's items.
   *
   * @param payload {CreateOrderPayload} - The payload containing the necessary information to create an order.
   * @returns An object containing the created order details and personalized product recommendations.
   */
  async createOrderWithRecommendations(payload: CreateOrderPayload) {
    const order = await this.createOrderService.execute(payload);

    const orderDto = plainToInstance(OrderDetailedResponseDto, order, {
      excludeExtraneousValues: true,
    });

    const productIds = (order.orderItems ?? []).map((item) => item.productId);
    const recommendations =
      await this.recommendationService.getPersonalizedRecommendations(
        payload.table.session.id,
        productIds,
      );

    return { ...orderDto, recommendations };
  }
}
