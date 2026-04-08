import { PrismaClient, PaymentProvider, PaymentFeeType } from '@prisma/client';

export async function seedPaymentMethods(prisma: PrismaClient) {
  const paymentMethods = [
    {
      provider: PaymentProvider.CASH,
      name: 'cash',
      display_name: 'Cash',
      icon_url: null,
      is_active: true,
      fee_type: null,
      fee_value: null,
      sort_order: 0,
    },
    {
      provider: PaymentProvider.MOMO,
      name: 'momo',
      display_name: 'MoMo',
      icon_url: null,
      is_active: true,
      fee_type: PaymentFeeType.PERCENTAGE,
      fee_value: 0.5,
      sort_order: 1,
    },
    {
      provider: PaymentProvider.VNPAY,
      name: 'vnpay',
      display_name: 'VNPay',
      icon_url: null,
      is_active: true,
      fee_type: PaymentFeeType.PERCENTAGE,
      fee_value: 0.5,
      sort_order: 2,
    },
  ];

  for (const method of paymentMethods) {
    const exists = await prisma.paymentMethod.findFirst({
      where: {
        name: method.name,
        display_name: method.display_name,
        provider: method.provider,
      },
    });

    if (!exists) {
      await prisma.paymentMethod.create({
        data: method,
      });
    }
  }
}
