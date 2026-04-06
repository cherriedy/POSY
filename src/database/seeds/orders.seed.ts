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

  const products = await prisma.product.findMany({
    where: { is_available: true, is_deleted: false },
    select: { id: true, price: true },
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

  // Create 2-5 orders per session
  for (const session of tableSessions) {
    const orderCount = faker.number.int({ min: 2, max: 5 });

    for (let i = 0; i < orderCount; i++) {
      // Randomly select an order status
      const status = faker.helpers.arrayElement([
        OrderStatus.PENDING,
        OrderStatus.PREPARING,
        OrderStatus.READY,
        OrderStatus.SERVED,
        OrderStatus.COMPLETED,
        OrderStatus.CANCELLED,
      ]);

      // Select 2-4 products for this order
      const orderItemCount = faker.number.int({ min: 2, max: 4 });
      const selectedProducts = faker.helpers.arrayElements(
        products,
        orderItemCount,
      );

      // Calculate subtotal
      let subtotalAmount = 0;
      const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] =
        selectedProducts.map((product) => {
          const quantity = faker.number.int({ min: 1, max: 3 });
          const unitPrice = parseFloat(product.price.toString());
          const itemSubtotal = quantity * unitPrice;
          subtotalAmount += itemSubtotal;

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
            started_at:
              status !== OrderStatus.PENDING
                ? faker.date.recent({ days: 1 })
                : undefined,
            completed_at:
              status === OrderStatus.COMPLETED ||
              status === OrderStatus.SERVED ||
              status === OrderStatus.READY
                ? faker.date.recent({ days: 1 })
                : undefined,
            served_at:
              status === OrderStatus.COMPLETED || status === OrderStatus.SERVED
                ? faker.date.recent({ days: 1 })
                : undefined,
          };
        });

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

      // Create the order
      await prisma.order.create({
        data: {
          created_by: session.user_id,
          table_id: session.table_id,
          session_id: session.id,
          status,
          note: faker.datatype.boolean()
            ? faker.lorem.sentence().substring(0, 200)
            : undefined,
          subtotal_amount: subtotalAmount,
          total_amount: totalAmount,
          orderItems: {
            create: orderItems,
          },
          orderTaxes: {
            create: orderTaxes,
          },
        },
      });
    }
  }
}
