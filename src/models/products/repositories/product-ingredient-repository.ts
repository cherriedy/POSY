import { Injectable } from '@nestjs/common';
import { ProductIngredientRepository } from './product-ingredient-repository.abstract';
import { ProductIngredient, ProductIngredientMapper } from '../entities';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import {
  DuplicateEntryException,
  ForeignKeyViolationException,
} from '../../../common/exceptions';
import { ProductIngredientNotFoundException } from '../exceptions';

@Injectable()
export class ProductIngredientRepositoryImpl implements ProductIngredientRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByProductId(productId: string): Promise<ProductIngredient[]> {
    return this.prismaService.productIngredient
      .findMany({
        where: { product_id: productId },
        include: {
          ingredient: { include: { unit: true, vendor: true } },
          product: true,
        },
      })
      .then((items) => items.map(ProductIngredientMapper.toDomain));
  }

  async bulkDeleteByProductIdAndIngredientIds(
    productId: string,
    ingredientIds: string[],
  ): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      // First, verify all ingredients exist for the product
      const existingRecords = await tx.productIngredient.findMany({
        where: {
          product_id: productId,
          ingredient_id: { in: ingredientIds },
        },
        select: { ingredient_id: true },
      });

      // Check if all requested ingredients were found
      if (existingRecords.length !== ingredientIds.length) {
        const foundIds = existingRecords.map((r) => r.ingredient_id);
        const missingIds = ingredientIds.filter((id) => !foundIds.includes(id));
        throw new ProductIngredientNotFoundException(
          `Ingredient(s) with ID(s) [${missingIds.join(', ')}] not associated with product ${productId}`,
        );
      }

      // Delete all ingredients atomically
      await tx.productIngredient.deleteMany({
        where: {
          product_id: productId,
          ingredient_id: { in: ingredientIds },
        },
      });
    });
  }

  async update(
    id: string,
    entity: Partial<ProductIngredient>,
  ): Promise<ProductIngredient> {
    try {
      const prisma = ProductIngredientMapper.toPrisma(
        entity as ProductIngredient,
      );
      return await this.prismaService.productIngredient
        .update({
          where: { id },
          data: prisma,
          include: {
            ingredient: { include: { unit: true, vendor: true } },
            product: true,
          },
        })
        .then(ProductIngredientMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Product ingredient relationship already exists',
          );
        } else if (e.code === 'P2003') {
          throw new ForeignKeyViolationException(entity);
        }
      }
      throw e;
    }
  }

  async bulkUpsert(
    productId: string,
    entities: ProductIngredient[],
  ): Promise<ProductIngredient[]> {
    return this.prismaService.$transaction(async (tx) => {
      const upserted = await Promise.all(
        entities.map((entity) =>
          tx.productIngredient.upsert({
            where: {
              product_id_ingredient_id: {
                product_id: productId,
                ingredient_id: entity.ingredientId,
              },
            },
            create: ProductIngredientMapper.toPrisma(entity),
            update: {
              quantity: ProductIngredientMapper.toPrisma(entity).quantity,
            },
            include: {
              ingredient: { include: { unit: true, vendor: true } },
              product: true,
            },
          }),
        ),
      );

      return upserted.map(ProductIngredientMapper.toDomain);
    });
  }
}
