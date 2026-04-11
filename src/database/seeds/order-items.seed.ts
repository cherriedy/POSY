import { faker } from '@faker-js/faker';
import { PrismaClient, OrderItemStatus } from '@prisma/client';

export async function seedOrderItems(prisma: PrismaClient) {
  // Fetch all orders
  const orders = await prisma.order.findMany({
    where: { status: { not: 'CANCELLED' } },
    select: { id: true, status: true, created_at: true },
  });

  // Fetch products along with their ingredient formulas
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

  if (!orders.length) {
    throw new Error('No orders found. Seed orders first.');
  }

  if (!products.length) {
    throw new Error('No available products found. Seed products first.');
  }

  // Key format: "YYYY-MM-DD|HH|ingredient_id"
  const ingredientUsageMap = new Map<
    string,
    { qty: number; orderCount: number; dayOfWeek: number; hourOfDay: number }
  >();

  for (const order of orders) {
    const existingItems = await prisma.orderItem.findMany({
      where: { order_id: order.id },
    });

    if (existingItems.length > 0) {
      continue;
    }

    const itemCount = faker.number.int({ min: 2, max: 4 });
    const selectedProducts = faker.helpers.arrayElements(
      products,
      Math.min(itemCount, products.length),
    );

    const orderDateString = order.created_at.toISOString().split('T')[0];
    const hourOfDay = order.created_at.getUTCHours();
    const dayOfWeek = order.created_at.getUTCDay(); // 0=Sunday, 6=Saturday
    let orderItemOrderCountTracker = false;

    for (const product of selectedProducts) {
      const quantity = faker.number.int({ min: 1, max: 3 });
      const unitPrice = parseFloat(product.price.toString());
      const subtotal = quantity * unitPrice;

      let itemStatus: OrderItemStatus;
      let startedAt: Date | undefined;
      let completedAt: Date | undefined;
      let servedAt: Date | undefined;

      // Calculate timestamps relative to order.created_at to keep
      // time logic consistent with historical orders created 60 days back
      switch (order.status) {
        case 'PENDING':
          itemStatus = OrderItemStatus.WAITING;
          break;
        case 'PREPARING':
          itemStatus = OrderItemStatus.PREPARING;
          startedAt = new Date(order.created_at.getTime() + 60000); // 1 min
          break;
        case 'READY':
          itemStatus = OrderItemStatus.DONE;
          startedAt = new Date(order.created_at.getTime() + 60000);
          completedAt = new Date(order.created_at.getTime() + 600000); // 10 mins
          break;
        case 'SERVING':
          itemStatus = OrderItemStatus.SERVING;
          startedAt = new Date(order.created_at.getTime() + 60000);
          completedAt = new Date(order.created_at.getTime() + 600000);
          servedAt = new Date(order.created_at.getTime() + 720000); // 12 mins
          break;
        case 'SERVED':
        case 'COMPLETED':
          itemStatus = OrderItemStatus.SERVED;
          startedAt = new Date(order.created_at.getTime() + 60000);
          completedAt = new Date(order.created_at.getTime() + 600000);
          servedAt = new Date(order.created_at.getTime() + 720000);

          // Accumulate ingredient usage for successful orders
          if (!orderItemOrderCountTracker) orderItemOrderCountTracker = true;
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
              // Only count the order once even if multiple dishes share the same ingredient
              orderCount: current.orderCount,
              dayOfWeek,
              hourOfDay,
            });
          }
          break;
        default:
          itemStatus = OrderItemStatus.WAITING;
      }

      await prisma.orderItem.create({
        data: {
          order_id: order.id,
          product_id: product.id,
          quantity,
          unit_price: unitPrice,
          subtotal,
          note: faker.datatype.boolean({ probability: 0.3 })
            ? faker.lorem.sentence().substring(0, 100)
            : undefined,
          status: itemStatus,
          started_at: startedAt,
          completed_at: completedAt,
          served_at: servedAt,
        },
      });
    }

    // If this order consumed ingredients, increment orderCount for its records in the Map
    if (orderItemOrderCountTracker) {
      for (const [key, data] of ingredientUsageMap.entries()) {
        if (key.startsWith(`${orderDateString}|${hourOfDay}|`)) {
          data.orderCount += 1;
        }
      }
    }
  }

  // ==========================================
  // UPSERT INGREDIENT USAGE STEP
  // ==========================================
  if (ingredientUsageMap.size > 0) {
    console.log(
      `Starting upsert of ${ingredientUsageMap.size} ingredient usage records from order items...`,
    );
    for (const [key, data] of ingredientUsageMap.entries()) {
      const [dateStr, , ingredient_id] = key.split('|');
      const usageDate = new Date(dateStr);

      // Use raw query for insert-on-conflict-update (Postgres standard)
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
}
