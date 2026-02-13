import { PrismaClient } from '@prisma/client';

export async function seedTaxes(prisma: PrismaClient) {
  // Helper to upsert by name (since name is not unique, but we want id for upsert)
  async function upsertTaxByName(
    taxData: Omit<
      Parameters<typeof prisma.taxConfig.create>[0]['data'],
      'id'
    > & { name: string },
  ) {
    const existing = await prisma.taxConfig.findFirst({
      where: { name: taxData.name },
    });
    if (existing) {
      await prisma.taxConfig.update({
        where: { id: existing.id },
        data: taxData,
      });
    } else {
      await prisma.taxConfig.create({ data: taxData });
    }
  }

  // 1. VAT (Value Added Tax) - 10%
  await upsertTaxByName({
    type: 'VAT',
    name: 'VAT',
    display_name: 'Value Added Tax',
    description: 'Thuế giá trị gia tăng (VAT) 10% áp dụng tại Việt Nam',
    rate_type: 'PERCENTAGE',
    charge_rate: 0.1,
    is_active: true,
    is_included: false,
    apply_after_vat: false,
    sort_order: 1,
  });

  // 2. Service Charge - 5%
  await upsertTaxByName({
    type: 'SERVICE_CHARGE',
    name: 'Service Charge',
    display_name: 'Phí phục vụ',
    description:
      'Phí phục vụ 5% thường áp dụng tại nhà hàng, khách sạn ở Việt Nam',
    rate_type: 'PERCENTAGE',
    charge_rate: 0.05,
    is_active: true,
    is_included: false,
    apply_after_vat: true,
    sort_order: 2,
  });

  // 3. Environmental Tax (optional, example)
  await upsertTaxByName({
    type: 'ENVIRONMENTAL',
    name: 'Environmental Tax',
    display_name: 'Thuế môi trường',
    description: 'Thuế bảo vệ môi trường (áp dụng cho một số sản phẩm)',
    rate_type: 'FIXED_AMOUNT',
    charge_rate: 2000,
    is_active: false,
    is_included: false,
    apply_after_vat: false,
    sort_order: 3,
  });

  // Seed Entity Tax Configs
  // Get all tax configs
  const vatTax = await prisma.taxConfig.findFirst({
    where: { name: 'VAT' },
  });
  const serviceChargeTax = await prisma.taxConfig.findFirst({
    where: { name: 'Service Charge' },
  });
  const environmentalTax = await prisma.taxConfig.findFirst({
    where: { name: 'Environmental Tax' },
  });

  if (!vatTax || !serviceChargeTax || !environmentalTax) {
    return;
  }

  // Helper function to upsert entity tax config
  async function upsertEntityTaxConfig(data: {
    tax_id: string;
    entity_id: string;
    entity_type: 'PRODUCT' | 'CATEGORY' | 'ZONE';
    is_active: boolean;
    note?: string;
  }) {
    const existing = await prisma.entityTaxConfig.findFirst({
      where: {
        tax_id: data.tax_id,
        entity_id: data.entity_id,
        entity_type: data.entity_type,
      },
    });

    if (existing) {
      await prisma.entityTaxConfig.update({
        where: { id: existing.id },
        data: {
          is_active: data.is_active,
          note: data.note,
        },
      });
    } else {
      await prisma.entityTaxConfig.create({ data });
    }
  }

  // Apply Service Charge to all zones
  const zones = await prisma.zone.findMany({
    select: { id: true, name: true },
  });

  for (const zone of zones) {
    await upsertEntityTaxConfig({
      tax_id: serviceChargeTax.id,
      entity_id: zone.id,
      entity_type: 'ZONE',
      is_active: true,
      note: `Service charge applied to zone: ${zone.name}`,
    });
  }

  // Apply Environmental Tax to specific products (example: drinks with plastic packaging)
  const products = await prisma.product.findMany({
    select: { id: true, name: true },
    take: 5, // Apply to first 5 products as example
  });

  for (const product of products) {
    await upsertEntityTaxConfig({
      tax_id: environmentalTax.id,
      entity_id: product.id,
      entity_type: 'PRODUCT',
      is_active: false, // Inactive by default since environmental tax is optional
      note: `Environmental tax configuration for product: ${product.name}`,
    });
  }
}
