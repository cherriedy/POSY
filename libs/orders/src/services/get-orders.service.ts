import { Injectable } from '@nestjs/common';
import { Order } from '../entities/order';
import { OrderNotFoundException } from '../exceptions/order-not-found.exception';
import { OrderQueryParams } from '../interfaces/order-query-params.interface';
import { Page } from '@posy/shared';
import { OrderRepository } from '../repositories/order-repository.abstract';

@Injectable()
export class GetOrdersService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async getAll(params: OrderQueryParams): Promise<Page<Order>> {
    return await this.orderRepository.getAllPaged(params);
  }

  async getById(id: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new OrderNotFoundException(id);
    return order;
  }

  async getBySessionId(sessionId: string): Promise<Order> {
    const order = await this.orderRepository.findBySessionId(sessionId);
    if (!order) throw new OrderNotFoundException(sessionId);
    return order;
  }
}
