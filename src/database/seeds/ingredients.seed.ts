import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { seedUnits } from './units.seed';
import { seedVendors } from './vendors.seed';

const INGREDIENT_NAMES = [
  'Tomato',
  'Onion',
  'Garlic',
  'Chicken Breast',
  'Beef Tenderloin',
  'Pork Belly',
  'Shrimp',
  'Salmon Fillet',
  'All-Purpose Flour',
  'Sugar',
  'Salt',
  'Black Pepper',
  'Olive Oil',
  'Butter',
  'Milk',
  'Egg',
  'Mozzarella Cheese',
  'Cheddar Cheese',
  'Heavy Cream',
  'Soy Sauce',
  'Fish Sauce',
  'Oyster Sauce',
  'Chili Pepper',
  'Basil',
  'Parsley',
  'Thyme',
  'Rosemary',
  'Lemon',
  'Lime',
  'Coconut Milk',
];

export async function seedIngredients(prisma: PrismaClient) {
  // ── Units ──────────────────────────────────────────────────────────────
  const createdUnits = await seedUnits(prisma);

  // ── Vendors ────────────────────────────────────────────────────────────
  const createdVendors = await seedVendors(prisma);

  // ── Ingredients ────────────────────────────────────────────────────────
  const ingredients = INGREDIENT_NAMES.map((name) => {
    const stock = faker.number.int({ min: 10, max: 500 });
    const minStock = faker.number.int({ min: 5, max: Math.floor(stock / 2) });

    return {
      name,
      vendor_id: faker.helpers.arrayElement(createdVendors).id,
      unit_id: faker.helpers.arrayElement(createdUnits).id,
      stock,
      min_stock: minStock,
      unit_cost: faker.number.float({ min: 0.5, max: 100, fractionDigits: 2 }),
      expired_at: faker.helpers.maybe(() => faker.date.future({ years: 1 }), {
        probability: 0.4,
      }),
    };
  });

  await prisma.ingredient.createMany({ data: ingredients });
  console.log(`Seeded ${ingredients.length} ingredients.`);
}
