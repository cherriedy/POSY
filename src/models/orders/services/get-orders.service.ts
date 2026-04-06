import { Injectable } from '@nestjs/common';
import { Order, OrderNotFoundException, OrderQueryParams } from '../shared';
import { Page } from '../../../common/interfaces';
import { OrderRepository } from '../shared/repositories/order-repository.abstract';

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
}
