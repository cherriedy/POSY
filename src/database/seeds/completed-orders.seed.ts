import { faker } from '@faker-js/faker';
import {
  PrismaClient,
  Prisma,
  OrderStatus,
  OrderItemStatus,
  PaymentStatus,
} from '@prisma/client';

export async function seedCompletedOrders(prisma: PrismaClient) {
  // Fetch necessary data
  const completedSessions = await prisma.tableSession.findMany({
    where: { status: 'COMPLETED' },
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
      type: true,
      name: true,
    },
  });

  const paymentMethods = await prisma.paymentMethod.findMany({
    where: { is_active: true },
    select: { id: true, fee_type: true, fee_value: true },
  });

  const promotions = await prisma.promotion.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, code: true, version: true, discount_value: true },
  });

  if (!completedSessions.length) {
    throw new Error(
      'No completed table sessions found. Seed table sessions first.',
    );
  }

  if (!products.length) {
    throw new Error('No available products found. Seed products first.');
  }

  if (!paymentMethods.length) {
    throw new Error('No payment methods found. Seed payment methods first.');
  }

  // Create 2-4 completed orders per completed session
  for (const session of completedSessions) {
    const orderCount = faker.number.int({ min: 2, max: 4 });

    for (let i = 0; i < orderCount; i++) {
      // Select 2-4 products for this order
      const orderItemCount = faker.number.int({ min: 2, max: 4 });
      const selectedProducts = faker.helpers.arrayElements(
        products,
        orderItemCount,
      );

      // Calculate subtotal
      let subtotalAmount = 0;
      const orderItems = selectedProducts.map((product) => {
        const quantity = faker.number.int({ min: 1, max: 3 });
        const unitPrice = parseFloat(product.price.toString());
        const itemSubtotal = quantity * unitPrice;
        subtotalAmount += itemSubtotal;

        return {
          product_id: product.id,
          quantity,
          unit_price: unitPrice,
          subtotal: itemSubtotal,
          note: faker.datatype.boolean()
            ? faker.lorem.sentence().substring(0, 100)
            : undefined,
          status: OrderItemStatus.SERVED,
          started_at: faker.date.recent({ days: 1 }),
          completed_at: faker.date.recent({ days: 1 }),
          served_at: faker.date.recent({ days: 1 }),
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

          // Build a fully snapshotted OrderTax payload
          orderTaxes.push({
            tax_config_id: tax.id,
            tax_name: tax.name,
            tax_type: tax.type,
            rate_type: tax.rate_type,
            charge_rate: tax.charge_rate,
            taxable_base: subtotalAmount,
            quantity: null,
            tax_amount: taxAmount,
          });
        }
      }

      // Calculate discount (optional)
      let discountAmount = 0;
      const pricingSnapshotPromotions: Array<{
        promotion_id: string;
        promotion_code: string;
        promotion_version: number;
        discount_amount: number | string;
      }> = [];

      if (
        promotions.length > 0 &&
        faker.datatype.boolean({ probability: 0.3 })
      ) {
        const selectedPromotion = faker.helpers.arrayElement(promotions);
        const discountValue = selectedPromotion.discount_value
          ? parseFloat(selectedPromotion.discount_value.toString())
          : 0;
        discountAmount = Math.min(discountValue, subtotalAmount * 0.5); // Cap at 50% of subtotal

        pricingSnapshotPromotions.push({
          promotion_id: selectedPromotion.id,
          promotion_code: selectedPromotion.code,
          promotion_version: selectedPromotion.version,
          discount_amount: discountAmount.toString(),
        });
      }

      const totalAmount = subtotalAmount - discountAmount + totalTaxAmount;

      // Create the order
      const order = await prisma.order.create({
        data: {
          created_by: session.user_id,
          table_id: session.table_id,
          session_id: session.id,
          status: OrderStatus.COMPLETED,
          note: faker.datatype.boolean()
            ? faker.lorem.sentence().substring(0, 200)
            : undefined,
          subtotal_amount: subtotalAmount,
          total_amount: totalAmount,
          orderItems: {
            create: orderItems as any,
          },
          orderTaxes: {
            create: orderTaxes as any,
          },
        },
      });

      // Create pricing snapshot
      const pricingSnapshot = await prisma.pricingSnapshot.create({
        data: {
          order_id: order.id,
          subtotal_amount: subtotalAmount,
          discount_amount: discountAmount,
          total_tax_amount: totalTaxAmount,
          total_amount: totalAmount,
          promotions: {
            create: pricingSnapshotPromotions,
          },
        },
      });

      // Create payment(s)
      const paymentMethod = faker.helpers.arrayElement(paymentMethods);
      let feeAmount = 0;

      if (paymentMethod.fee_type === 'PERCENTAGE' && paymentMethod.fee_value) {
        feeAmount =
          (totalAmount * parseFloat(paymentMethod.fee_value.toString())) / 100;
      } else if (
        paymentMethod.fee_type === 'FIXED_AMOUNT' &&
        paymentMethod.fee_value
      ) {
        feeAmount = parseFloat(paymentMethod.fee_value.toString());
      }

      await prisma.payment.create({
        data: {
          method_id: paymentMethod.id,
          order_id: order.id,
          created_by: session.user_id,
          amount: totalAmount,
          fee_amount: feeAmount > 0 ? feeAmount : null,
          status: PaymentStatus.COMPLETED,
          paid_at: faker.date.recent({ days: 1 }),
          reference_number: faker.string.alphanumeric(16).toUpperCase(),
          metadata: {
            snapshot_id: pricingSnapshot.id,
            order_items_count: orderItems.length,
          },
        },
      });
    }
  }
}
