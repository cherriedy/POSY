import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { ProductAttributeRepository } from './product-attribute-repository.abstract';
import { ProductAttribute, ProductAttributeMapper } from '../entities';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import {
  DuplicateEntryException,
  ForeignKeyViolationException,
} from '../../../common/exceptions';
import { camelCaseToSnakeCase } from '../../../common/utilities/string.util';

@Injectable()
export class ProductAttributeRepositoryImpl implements ProductAttributeRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(entity: ProductAttribute): Promise<ProductAttribute> {
    try {
      const prismaData = ProductAttributeMapper.toPrisma(entity);
      const created = await this.prismaService.productAttribute.create({
        include: { cuisine: true },
        data: prismaData,
      });
      return ProductAttributeMapper.toDomain(created);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Product attributes already exist for this product',
          );
        }
        if (e.code === 'P2003') {
          throw new ForeignKeyViolationException(entity);
        }
      }
      throw e;
    }
  }

  async findByProductId(productId: string): Promise<ProductAttribute | null> {
    const attribute = await this.prismaService.productAttribute.findUnique({
      include: { cuisine: true },
      where: { product_id: productId },
    });
    return attribute ? ProductAttributeMapper.toDomain(attribute) : null;
  }

  async update(
    productId: string,
    entity: Partial<ProductAttribute>,
  ): Promise<ProductAttribute> {
    try {
      const dataSnakeCase = Object.entries(entity).reduce(
        (acc, [key, value]) => {
          const snakeKey = camelCaseToSnakeCase(key);
          acc[snakeKey] = value;
          return acc;
        },
        {} as Record<string, any>,
      );

      const updated = await this.prismaService.productAttribute.update({
        include: { cuisine: true },
        where: { product_id: productId },
        data: dataSnakeCase,
      });
      return ProductAttributeMapper.toDomain(updated);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new Error(
          `Product attributes for product "${productId}" not found`,
        );
      }
      throw e;
    }
  }
}
