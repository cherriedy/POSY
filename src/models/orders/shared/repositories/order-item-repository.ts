import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../providers/prisma/prisma.service';
import { OrderItemRepository } from './order-item-repository.abstract';
import { OrderItem, OrderItemMapper } from '../entities';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import {
  DuplicateEntryException,
  ForeignKeyViolationException,
} from '../../../../common/exceptions';

const orderItemInclude = {
  product: true,
  orderTaxes: true,
};

@Injectable()
export class OrderItemRepositoryImpl implements OrderItemRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(entity: OrderItem): Promise<OrderItem> {
    try {
      const prisma = OrderItemMapper.toPrisma(entity);
      return await this.prismaService.orderItem
        .create({ data: prisma, include: orderItemInclude })
        .then(OrderItemMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Order item with provided data already exists',
          );
        }
        if (e.code === 'P2003') {
          throw new ForeignKeyViolationException(entity);
        }
      }
      throw e;
    }
  }

  async bulkCreate(entities: OrderItem[]): Promise<OrderItem[]> {
    try {
      const prismaItems = entities.map((e) => OrderItemMapper.toPrisma(e));

      // Use transaction to create all items
      return await this.prismaService
        .$transaction(
          prismaItems.map((item) =>
            this.prismaService.orderItem.create({
              data: item,
              include: orderItemInclude,
            }),
          ),
        )
        .then((items) => items.map(OrderItemMapper.toDomain));
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'One or more order items already exist',
          );
        }
        if (e.code === 'P2003') {
          throw new ForeignKeyViolationException({ items: entities });
        }
      }
      throw e;
    }
  }

  async findById(id: string): Promise<OrderItem | null> {
    const item = await this.prismaService.orderItem.findUnique({
      where: { id },
      include: orderItemInclude,
    });
    if (!item) return null;
    return OrderItemMapper.toDomain(item);
  }

  async findByOrderId(orderId: string): Promise<OrderItem[]> {
    const items = await this.prismaService.orderItem.findMany({
      where: { order_id: orderId },
      include: orderItemInclude,
    });
    return items.map(OrderItemMapper.toDomain);
  }

  async findByOrderIdAndItemId(
    orderId: string,
    itemId: string,
  ): Promise<OrderItem | null> {
    return await this.prismaService.orderItem
      .findUnique({
        where: { order_id: orderId, id: itemId },
        include: orderItemInclude,
      })
      .then((i) => (i ? OrderItemMapper.toDomain(i) : null));
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.orderItem.delete({ where: { id } });
  }

  async update(id: string, entity: Partial<OrderItem>): Promise<OrderItem> {
    try {
      return await this.prismaService.orderItem
        .update({
          where: { id },
          data: {
            quantity: entity.quantity,
            unit_price: entity.unitPrice,
            subtotal: entity.subtotal,
            note: entity.note,
            status: entity.status,
            started_at: entity.startedAt,
            completed_at: entity.completedAt,
            served_at: entity.servedAt,
          },
          include: orderItemInclude,
        })
        .then(OrderItemMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new Error(`Order item with ID "${id}" was not found`);
      }
      throw e;
    }
  }
}
