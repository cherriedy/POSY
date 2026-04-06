import { faker } from '@faker-js/faker';
import { PrismaClient, OrderItemStatus } from '@prisma/client';

export async function seedOrderItems(prisma: PrismaClient) {
  // Fetch all orders and products
  const orders = await prisma.order.findMany({
    where: { status: { not: 'CANCELLED' } },
    select: { id: true, status: true, created_at: true },
  });

  const products = await prisma.product.findMany({
    where: { is_available: true, is_deleted: false },
    select: { id: true, price: true },
  });

  if (!orders.length) {
    throw new Error('No orders found. Seed orders first.');
  }

  if (!products.length) {
    throw new Error('No available products found. Seed products first.');
  }

  // For each order, ensure it has 2-4 order items
  for (const order of orders) {
    // Check existing items
    const existingItems = await prisma.orderItem.findMany({
      where: { order_id: order.id },
    });

    // If order already has items, skip it
    if (existingItems.length > 0) {
      continue;
    }

    // Generate 2-4 items for this order
    const itemCount = faker.number.int({ min: 2, max: 4 });
    const selectedProducts = faker.helpers.arrayElements(
      products,
      Math.min(itemCount, products.length),
    );

    for (const product of selectedProducts) {
      const quantity = faker.number.int({ min: 1, max: 3 });
      const unitPrice = parseFloat(product.price.toString());
      const subtotal = quantity * unitPrice;

      // Determine order item status based on order status
      let itemStatus: OrderItemStatus;
      let startedAt: Date | undefined;
      let completedAt: Date | undefined;
      let servedAt: Date | undefined;

      switch (order.status) {
        case 'PENDING':
          itemStatus = OrderItemStatus.WAITING;
          break;
        case 'PREPARING':
          itemStatus = OrderItemStatus.PREPARING;
          startedAt = faker.date.recent({ days: 1 });
          break;
        case 'READY':
          itemStatus = OrderItemStatus.DONE;
          startedAt = new Date(order.created_at.getTime() + 300000); // 5 min after order
          completedAt = faker.date.recent({ days: 1 });
          break;
        case 'SERVING':
          itemStatus = OrderItemStatus.SERVING;
          startedAt = new Date(order.created_at.getTime() + 300000);
          completedAt = new Date(order.created_at.getTime() + 900000); // 15 min after order
          servedAt = faker.date.recent({ days: 1 });
          break;
        case 'SERVED':
        case 'COMPLETED':
          itemStatus = OrderItemStatus.SERVED;
          startedAt = new Date(order.created_at.getTime() + 300000);
          completedAt = new Date(order.created_at.getTime() + 900000);
          servedAt = new Date(order.created_at.getTime() + 1800000); // 30 min after order
          break;
        case 'CANCELLED':
          itemStatus = OrderItemStatus.CANCELLED;
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
  }
}
