import { faker } from '@faker-js/faker';
import {
  DietaryTag,
  MealSession,
  PrismaClient,
  ProductDiscountType,
  Season,
  Taste,
} from '@prisma/client';
import { MeiliSearch } from 'meilisearch';
import { ProductDiscountType as DomainProductDiscountType } from '../../models/products/enums/product.enum';

if (!process.env.MEILI_HOST) {
  throw new Error('Meilisearch host is missing in environment variables.');
}

if (!process.env.MEILI_MASTER_KEY) {
  throw new Error(
    'Meilisearch master key is missing in environment variables.',
  );
}

const meiliClient = new MeiliSearch({
  host: process.env.MEILI_HOST,
  apiKey: process.env.MEILI_MASTER_KEY,
});

/**
 * Generate a URL-friendly slug from a string
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

export async function seedProducts(prisma: PrismaClient) {
  // Fetch all categories from the database
  const categories = await prisma.category.findMany({
    where: { is_active: true },
    select: { id: true },
  });

  if (!categories.length) {
    throw new Error('No active categories found. Seed categories first.');
  }

  const products = Array.from({ length: 30 }).map(() => {
    const category = faker.helpers.arrayElement(categories);
    const productName = faker.commerce.productName();
    const discountType = faker.helpers.arrayElement([
      ProductDiscountType.PERCENTAGE,
      ProductDiscountType.FIXED_AMOUNT,
      undefined,
    ]);
    let discountValue: number | null = null;
    if (discountType === ProductDiscountType.PERCENTAGE) {
      discountValue = faker.number.float({
        min: 1,
        max: 50,
        fractionDigits: 2,
      });
    } else if (discountType === ProductDiscountType.FIXED_AMOUNT) {
      discountValue = faker.number.float({
        min: 1,
        max: 100,
        fractionDigits: 2,
      });
    }
    return {
      category_id: category.id,
      sku: faker.string.alphanumeric(8).toUpperCase(),
      name: productName,
      slug:
        generateSlug(productName) +
        '-' +
        faker.string.alphanumeric(6).toLowerCase(),
      description: faker.commerce.productDescription(),
      price: faker.number.float({ min: 1, max: 500, fractionDigits: 2 }),
      discount_type: discountType,
      discount_value: discountValue,
      image_url: faker.image.urlPicsumPhotos({ width: 500, height: 500 }),
      stock_quantity: faker.number.int({ min: 0, max: 200 }),
      is_available: faker.datatype.boolean(),
      is_deleted: false,
      deleted_at: null,
      created_at: faker.date.past({ years: 1 }),
      updated_at: new Date(),
    };
  });

  for (const product of products) {
    // Ensure SKU and slug uniqueness
    const existsBySku = await prisma.product.findUnique({
      where: { sku: product.sku },
    });
    const existsBySlug = await prisma.product.findUnique({
      where: { slug: product.slug },
    });
    if (!existsBySku && !existsBySlug) {
      await prisma.product.create({ data: product });
    }
  }

  // After seeding, fetch all created products
  const seededProducts = await prisma.product.findMany({
    include: { category: true },
  });

  // ── Fetch ingredients from DB for use in product ingredient seeds ──────────
  const ingredients = await prisma.ingredient.findMany({
    select: { id: true },
  });

  if (!ingredients.length) {
    throw new Error('No ingredients found. Seed ingredients first.');
  }

  // ── Fetch cuisines from DB for use in product attribute seeds ──────────────
  const cuisines = await prisma.cuisine.findMany({
    where: { is_deleted: false },
    select: { id: true, name: true, region: true },
  });

  if (!cuisines.length) {
    throw new Error('No cuisines found. Seed cuisines first.');
  }

  // ── Seed product attributes & ingredients for each product ─────────────────
  for (const product of seededProducts) {
    // Skip if attributes already exist
    const existingAttr = await prisma.productAttribute.findUnique({
      where: { product_id: product.id },
    });

    if (!existingAttr) {
      const cuisine = faker.helpers.arrayElement(cuisines);

      const isSeasonal = faker.datatype.boolean({ probability: 0.3 });
      const season = isSeasonal
        ? faker.helpers.arrayElement<Season>([
            Season.SPRING,
            Season.SUMMER,
            Season.AUTUMN,
            Season.WINTER,
          ])
        : null;

      await prisma.productAttribute.create({
        data: {
          product_id: product.id,
          cuisine_id: cuisine.id,
          meal_session: faker.helpers.arrayElement<MealSession>([
            MealSession.BREAKFAST,
            MealSession.LUNCH,
            MealSession.DINNER,
            MealSession.SNACK,
          ]),
          taste_profile: faker.helpers.arrayElements<Taste>(
            [Taste.SPICY, Taste.SWEET, Taste.SOUR, Taste.SALTY, Taste.BITTER],
            { min: 1, max: 3 },
          ),
          dietary_tags: faker.helpers.arrayElements<DietaryTag>(
            [
              DietaryTag.VEGETARIAN,
              DietaryTag.VEGAN,
              DietaryTag.GLUTEN_FREE,
              DietaryTag.DAIRY_FREE,
              DietaryTag.NUT_FREE,
              DietaryTag.HALAL,
              DietaryTag.KOSHER,
            ],
            { min: 0, max: 3 },
          ),
          preparation_time: faker.helpers.maybe(
            () => faker.number.int({ min: 5, max: 60 }),
            { probability: 0.8 },
          ),
          spice_level: faker.helpers.maybe(
            () => faker.number.int({ min: 0, max: 5 }),
            { probability: 0.8 },
          ),
          is_seasonal: isSeasonal,
          season,
        },
      });
    }

    // Seed 1–4 random ingredients per product (skip duplicates)
    const existingIngredients = await prisma.productIngredient.findMany({
      where: { product_id: product.id },
      select: { ingredient_id: true },
    });
    const existingIds = new Set(
      existingIngredients.map((i) => i.ingredient_id),
    );

    const selectedIngredients = faker.helpers
      .arrayElements(ingredients, { min: 1, max: 4 })
      .filter((i) => !existingIds.has(i.id));

    for (const ingredient of selectedIngredients) {
      await prisma.productIngredient.create({
        data: {
          product_id: product.id,
          ingredient_id: ingredient.id,
          quantity: faker.number.float({
            min: 0.05,
            max: 5,
            fractionDigits: 4,
          }),
        },
      });
    }
  }

  // ── Index to Meilisearch ───────────────────────────────────────────────────
  const productsForMeili = seededProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price:
      typeof p.price === 'object' && p.price !== null && 'toNumber' in p.price
        ? p.price.toNumber()
        : p.price,
    discountType: p.discount_type as DomainProductDiscountType,
    discountValue:
      p.discount_value !== null &&
      typeof p.discount_value === 'object' &&
      'toNumber' in p.discount_value
        ? p.discount_value.toNumber()
        : p.discount_value,
    imageUrl: p.image_url,
    isDeleted: p.is_deleted,
    isAvailable: p.is_available,
    stockQuantity: p.stock_quantity,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    categoryId: p.category_id,
    sku: p.sku,
    description: p.description,
    deletedAt: p.deleted_at,
    category: p.category,
  }));

  await meiliClient.index('products').addDocuments(productsForMeili);
}
