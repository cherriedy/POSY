import { faker } from '@faker-js/faker';
import {
  OrderStatus,
  OrderItemStatus,
  PrismaClient,
  Prisma,
} from '@prisma/client';

export async function seedOrders(prisma: PrismaClient) {
  // Fetch necessary data
  const tableSessions = await prisma.tableSession.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, table_id: true, user_id: true },
  });

  // Fetch product ingredient formulas for each product
  const products = await prisma.product.findMany({
    where: { is_available: true, is_deleted: false },
    select: {
      id: true,
      price: true,
      productIngredients: {
        select: { ingredient_id: true, quantity: true },
      },
    },
  });

  const taxConfigs = await prisma.taxConfig.findMany({
    where: { is_active: true, is_deleted: false },
    select: {
      id: true,
      charge_rate: true,
      rate_type: true,
      name: true,
      type: true,
    },
  });

  if (!tableSessions.length) {
    throw new Error(
      'No active table sessions found. Seed table sessions first.',
    );
  }

  if (!products.length) {
    throw new Error('No available products found. Seed products first.');
  }

  // Initialize a Map to aggregate ingredient consumption in memory
  // Key format: "YYYY-MM-DD|HH|ingredient_id"
  const ingredientUsageMap = new Map<
    string,
    { qty: number; orderCount: number; dayOfWeek: number; hourOfDay: number }
  >();

  // Create 2-5 orders per session
  for (const session of tableSessions) {
    const orderCount = faker.number.int({ min: 2, max: 5 });

    for (let i = 0; i < orderCount; i++) {
      // Spread orders over 60 days for Prophet to have enough data for trend and seasonality learning
      const orderDate = faker.date.recent({ days: 60 });
      const orderDateString = orderDate.toISOString().split('T')[0];
      const hourOfDay = orderDate.getUTCHours();
      const dayOfWeek = orderDate.getUTCDay(); // 0=Sunday, 6=Saturday

      const status = faker.helpers.arrayElement([
        OrderStatus.PENDING,
        OrderStatus.PREPARING,
        OrderStatus.READY,
        OrderStatus.SERVED,
        OrderStatus.COMPLETED,
        OrderStatus.CANCELLED,
      ]);

      const orderItemCount = faker.number.int({ min: 2, max: 4 });
      const selectedProducts = faker.helpers.arrayElements(
        products,
        orderItemCount,
      );

      let subtotalAmount = 0;
      let orderItemOrderCountTracker = false; // Track order_count for ingredient

      const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] =
        selectedProducts.map((product) => {
          const quantity = faker.number.int({ min: 1, max: 3 });
          const unitPrice = parseFloat(product.price.toString());
          const itemSubtotal = quantity * unitPrice;
          subtotalAmount += itemSubtotal;

          // Calculate time fields based on orderDate
          const startedAt =
            status !== OrderStatus.PENDING
              ? new Date(orderDate.getTime() + 5 * 60000) // 5 min later
              : undefined;

          const completedAt =
            status === OrderStatus.COMPLETED ||
            status === OrderStatus.SERVED ||
            status === OrderStatus.READY
              ? new Date(orderDate.getTime() + 15 * 60000) // 15 min later
              : undefined;

          const servedAt =
            status === OrderStatus.COMPLETED || status === OrderStatus.SERVED
              ? new Date(orderDate.getTime() + 20 * 60000) // 20 min later
              : undefined;

          // Save ingredient consumption history (only for successful orders)
          if (
            status === OrderStatus.COMPLETED ||
            status === OrderStatus.SERVED
          ) {
            if (!orderItemOrderCountTracker) orderItemOrderCountTracker = true;

            // Get the recipe for the dish and multiply by the quantity ordered
            for (const pi of product.productIngredients) {
              const key = `${orderDateString}|${hourOfDay}|${pi.ingredient_id}`;
              const usageQty = quantity * parseFloat(pi.quantity.toString());

              const current = ingredientUsageMap.get(key) || {
                qty: 0,
                orderCount: 0,
                dayOfWeek,
                hourOfDay,
              };
              ingredientUsageMap.set(key, {
                qty: current.qty + usageQty,
                // Only count order once even if multiple dishes share the same ingredient
                orderCount: current.orderCount,
                dayOfWeek,
                hourOfDay,
              });
            }
          }

          return {
            product: { connect: { id: product.id } },
            quantity,
            unit_price: unitPrice,
            subtotal: itemSubtotal,
            note: faker.datatype.boolean()
              ? faker.lorem.sentence().substring(0, 100)
              : undefined,
            status:
              status === OrderStatus.CANCELLED
                ? OrderItemStatus.CANCELLED
                : faker.helpers.arrayElement([
                    OrderItemStatus.WAITING,
                    OrderItemStatus.PREPARING,
                    OrderItemStatus.DONE,
                    OrderItemStatus.SERVED,
                  ]),
            started_at: startedAt,
            completed_at: completedAt,
            served_at: servedAt,
          };
        });

      // If this order used ingredients, increment orderCount for relevant records in the Map
      if (orderItemOrderCountTracker) {
        for (const [key, data] of ingredientUsageMap.entries()) {
          if (key.startsWith(`${orderDateString}|${hourOfDay}|`)) {
            data.orderCount += 1;
          }
        }
      }

      // Calculate taxes
      let totalTaxAmount = 0;
      const orderTaxes: Prisma.OrderTaxCreateWithoutOrderInput[] = [];

      if (taxConfigs.length > 0) {
        const selectedTaxCount = faker.number.int({
          min: 1,
          max: Math.min(2, taxConfigs.length),
        });
        const selectedTaxes = faker.helpers.arrayElements(
          taxConfigs,
          selectedTaxCount,
        );

        for (const tax of selectedTaxes) {
          let taxAmount = 0;
          if (tax.rate_type === 'PERCENTAGE') {
            const chargeRate = parseFloat(tax.charge_rate.toString());
            taxAmount = (subtotalAmount * chargeRate) / 100;
          } else if (tax.rate_type === 'FIXED_AMOUNT') {
            taxAmount = parseFloat(tax.charge_rate.toString());
          }
          totalTaxAmount += taxAmount;

          orderTaxes.push({
            tax_config_id: tax.id,
            tax_name: tax.name ?? `Tax ${tax.id}`,
            tax_type: tax.type,
            rate_type: tax.rate_type,
            charge_rate: tax.charge_rate,
            taxable_base: subtotalAmount,
            quantity: null,
            tax_amount: taxAmount,
          });
        }
      }

      const totalAmount = subtotalAmount + totalTaxAmount;

      // Create the order with explicitly assigned created_at for historical distribution
      await prisma.order.create({
        data: {
          created_by: session.user_id,
          table_id: session.table_id,
          session_id: session.id,
          status,
          created_at: orderDate, // Assigned historically
          updated_at: orderDate,
          note: faker.datatype.boolean()
            ? faker.lorem.sentence().substring(0, 200)
            : undefined,
          subtotal_amount: subtotalAmount,
          total_amount: totalAmount,
          orderItems: { create: orderItems },
          orderTaxes: { create: orderTaxes },
        },
      });
    }
  }

  // ==========================================
  // UPSERT INGREDIENT USAGE STEP
  // ==========================================
  if (ingredientUsageMap.size > 0) {
    console.log(
      `Starting upsert of ${ingredientUsageMap.size} ingredient usage records...`,
    );
    for (const [key, data] of ingredientUsageMap.entries()) {
      const [dateStr, , ingredient_id] = key.split('|');
      const usageDate = new Date(dateStr);

      // Use raw query to perform insert on conflict update (Postgres standard)
      // ON CONFLICT matches the unique index on (ingredient_id, usage_date, hour_of_day)
      await prisma.$executeRaw`
        INSERT INTO ingredient_usages (ingredient_id, usage_date, quantity_used, order_count, day_of_week, hour_of_day)
        VALUES (${ingredient_id}::uuid, ${usageDate}::date, ${data.qty}, ${data.orderCount}, ${data.dayOfWeek}, ${data.hourOfDay})
        ON CONFLICT (ingredient_id, usage_date, hour_of_day) DO UPDATE
        SET 
          quantity_used = ingredient_usages.quantity_used + EXCLUDED.quantity_used,
          order_count = ingredient_usages.order_count + EXCLUDED.order_count;
      `;
    }
  }

  // ==========================================
  // ENSURE MINIMUM 14 DAYS OF USAGE PER INGREDIENT
  // ==========================================
  // Prophet requires at least 2 periods of seasonality data to train reliably.
  // 14 days guarantees two full weekly cycles.
  const allIngredients = await prisma.ingredient.findMany({
    select: { id: true },
  });

  console.log(
    `Ensuring at least 14 days of usage data for ${allIngredients.length} ingredients...`,
  );

  const now = new Date();

  for (const ingredient of allIngredients) {
    // Fetch distinct dates already covered for this ingredient
    const rows = await prisma.$queryRaw<{ usage_date: string }[]>`
      SELECT DISTINCT TO_CHAR(usage_date, 'YYYY-MM-DD') AS usage_date
      FROM ingredient_usages
      WHERE ingredient_id = ${ingredient.id}::uuid
    `;

    const coveredDates = new Set(rows.map((r) => r.usage_date));
    const needed = 14 - coveredDates.size;

    if (needed <= 0) continue;

    // Collect candidate dates within the 60-day window that are not yet covered
    const candidates: string[] = [];
    for (let d = 1; d <= 60; d++) {
      const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      if (!coveredDates.has(dateStr)) {
        candidates.push(dateStr);
      }
    }

    const toFill = faker.helpers.arrayElements(
      candidates,
      Math.min(needed, candidates.length),
    );

    for (const dateStr of toFill) {
      const usageDate = new Date(dateStr);
      const syntheticDayOfWeek = usageDate.getUTCDay();
      const syntheticHourOfDay = faker.number.int({ min: 8, max: 21 }); // Realistic restaurant hours
      const syntheticQty = parseFloat(
        faker.number.float({ min: 0.5, max: 5 }).toFixed(4),
      );
      const syntheticOrderCount = faker.number.int({ min: 1, max: 5 });

      await prisma.$executeRaw`
        INSERT INTO ingredient_usages (ingredient_id, usage_date, quantity_used, order_count, day_of_week, hour_of_day)
        VALUES (${ingredient.id}::uuid, ${usageDate}::date, ${syntheticQty}, ${syntheticOrderCount}, ${syntheticDayOfWeek}, ${syntheticHourOfDay})
        ON CONFLICT (ingredient_id, usage_date, hour_of_day) DO UPDATE
        SET
          quantity_used = ingredient_usages.quantity_used + EXCLUDED.quantity_used,
          order_count = ingredient_usages.order_count + EXCLUDED.order_count;
      `;
    }
  }

  console.log('Ingredient usage coverage check complete.');
}
