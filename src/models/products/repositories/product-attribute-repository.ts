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

  async findByProductId(productId: string): Promise<ProductAttribute | null> {
    const attribute = await this.prismaService.productAttribute.findUnique({
      include: { cuisine: true },
      where: { product_id: productId },
    });
    return attribute ? ProductAttributeMapper.toDomain(attribute) : null;
  }

  async upsert(entity: Partial<ProductAttribute>): Promise<ProductAttribute> {
    try {
      const dataSnakeCase = Object.entries(entity).reduce(
        (acc, [key, value]) => {
          const snakeKey = camelCaseToSnakeCase(key);
          acc[snakeKey] = value;
          return acc;
        },
        {} as Record<string, any>,
      );

      // Remove undefined values
      Object.keys(dataSnakeCase).forEach((key) => {
        if (dataSnakeCase[key] === undefined) {
          delete dataSnakeCase[key];
        }
      });

      const upserted = await this.prismaService.productAttribute.upsert({
        where: { product_id: entity.productId! },
        create: {
          product_id: entity.productId!,
          ...dataSnakeCase,
        },
        update: dataSnakeCase,
        include: { cuisine: true },
      });
      return ProductAttributeMapper.toDomain(upserted);
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
}
