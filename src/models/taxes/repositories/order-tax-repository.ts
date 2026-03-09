import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { OrderTaxRepository } from './order-tax-repository.abstract';
import { OrderTax, OrderTaxMapper } from '../entities';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import {
  DuplicateEntryException,
  ForeignKeyViolationException,
} from '../../../common/exceptions';

@Injectable()
export class OrderTaxRepositoryImpl implements OrderTaxRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(entity: OrderTax): Promise<OrderTax> {
    try {
      const prisma = OrderTaxMapper.toPrisma(entity);
      const created = await this.prismaService.orderTax.create({
        data: prisma,
        include: {
          tax: true,
          order: true,
          order_item: true,
        },
      });
      return OrderTaxMapper.toDomain(created);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Order tax with provided data already exists',
          );
        }
        if (e.code === 'P2003') {
          throw new ForeignKeyViolationException(entity);
        }
      }
      throw e;
    }
  }

  async bulkCreate(entities: OrderTax[]): Promise<OrderTax[]> {
    try {
      const prismaItems = entities.map((e) => OrderTaxMapper.toPrisma(e));

      return await this.prismaService
        .$transaction(
          prismaItems.map((item) =>
            this.prismaService.orderTax.create({
              data: item,
              include: {
                tax: true,
                order: true,
                order_item: true,
              },
            }),
          ),
        )
        .then((items) => items.map(OrderTaxMapper.toDomain));
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'One or more order taxes already exist',
          );
        }
        if (e.code === 'P2003') {
          throw new ForeignKeyViolationException({ items: entities });
        }
      }
      throw e;
    }
  }

  async findByOrderId(orderId: string): Promise<OrderTax[]> {
    const taxes = await this.prismaService.orderTax.findMany({
      where: { order_id: orderId },
      include: {
        tax: true,
        order: true,
        order_item: true,
      },
    });
    return taxes.map(OrderTaxMapper.toDomain);
  }

  async findByOrderItemId(orderItemId: string): Promise<OrderTax[]> {
    const taxes = await this.prismaService.orderTax.findMany({
      where: { order_item_id: orderItemId },
      include: {
        tax: true,
        order: true,
        order_item: true,
      },
    });
    return taxes.map(OrderTaxMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.orderTax.delete({ where: { id } });
  }
}
