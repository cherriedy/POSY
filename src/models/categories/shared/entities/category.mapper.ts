import { Category as PrismaCategory, Prisma } from '@prisma/client';
import { Category } from './category';
import { MissingRequireFieldsException } from '../../../../common/exceptions';
import { getSlug } from 'src/common/utilities/string.util';

export class CategoryMapper {
  static toDomain(this: void, prismaCategory: PrismaCategory): Category {
    return new Category(
      prismaCategory.id,
      prismaCategory.name,
      prismaCategory.slug,
      prismaCategory.description,
      prismaCategory.is_active,
      prismaCategory.is_deleted,
      prismaCategory.deleted_at,
      prismaCategory.created_at,
      prismaCategory.updated_at,
    );
  }

  static toPrismaCreateInput(
    this: void,
    domain: Category,
  ): Prisma.CategoryCreateInput {
    if (!domain.name) throw new MissingRequireFieldsException(['name']);
    if (!domain.slug) domain.slug = getSlug(domain.name);
    return {
      name: domain.name,
      slug: domain.slug,
      description: domain.description,
      is_active: domain.isActive,
    };
  }

  static toPrismaUpdateInput(
    this: void,
    domain: Partial<Category>,
  ): Prisma.CategoryUpdateInput {
    const data: Prisma.CategoryUpdateInput = {};
    if (domain.name !== undefined) {
      data.name = domain.name;
      // If slug is not provided, generate it from the new name
      data.slug = !domain.slug ? getSlug(domain.name) : domain.slug;
    }
    if (domain.description !== undefined) {
      data.description = domain.description;
    }
    if (domain.isActive !== undefined) {
      data.is_active = domain.isActive;
    }
    if (domain.isDeleted !== undefined) {
      data.is_deleted = domain.isDeleted;
    }
    if (domain.deletedAt !== undefined) {
      data.deleted_at = domain.deletedAt;
    }
    return data;
  }
}
