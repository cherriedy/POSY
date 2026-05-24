import { Global, Module } from '@nestjs/common';
import { TableSessionConfig } from '../../../src/models/table-sessions/table-session.config';
import { TableSessionGuard } from '../../../src/models/table-sessions/shared/guards/table-session.guard';
import { SessionPreferenceRepository } from '../../../src/models/table-sessions/shared/repositories/session-preference-repository.abstract';
import { TableSessionRepository } from '../../../src/models/table-sessions/shared/repositories/table-session-repository.abstract';
import { ProductRepository } from '../../../src/models/products/repositories/product-repository.abstract';
import { ProductAttributeRepository } from '../../../src/models/products/repositories/product-attribute-repository.abstract';
import { TableRepository } from '../../../src/models/tables/repositories/table-repository.abstract';
import { OrderRepository } from '../../../src/models/orders/shared/repositories/order-repository.abstract';
import { OrderItemRepository } from '../../../src/models/orders/shared/repositories/order-item-repository.abstract';
import { PricingSnapshotRepository } from '../../../src/models/orders/shared/repositories/pricing-snapshot-repository.abstract';
import { EntityTaxConfigRepository } from '../../../src/models/taxes/repositories/entity-tax-config-repository.abstract';
import { TaxRepository } from '../../../src/models/taxes/repositories/tax-repository.abstract';
import { OrderTaxRepository } from '../../../src/models/taxes/repositories/order-tax-repository.abstract';
import { PromotionRedemptionRepository } from '../../../src/models/promotions/repositories/promotion-redemption-repository.abstract';
import { ZoneRepository } from '../../../src/models/zones/repositories/zone-repository.abstract';
import { CategoryRepository } from '../../../src/models/categories/shared/repositories/category-repository.abstract';
import { UnitOfWork } from '@posy/shared';

// ─── Prisma mock ─────────────────────────────────────────────────────────────
export const mockPrisma = {
  order: {
    create: jest.fn(),
  },
  product: {
    findMany: jest.fn(),
  },
  table: {
    findUnique: jest.fn(),
  },
  tableSession: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
};

// ─── Repository mocks ────────────────────────────────────────────────────────
export const mockProductRepository = {
  getByIds: jest.fn(),
  findById: jest.fn(),
};

export const mockTableRepository = {
  findById: jest.fn(),
};

export const mockOrderRepository = {
  create: jest.fn(),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  update: jest.fn().mockImplementation((id: string, data: any) => ({
    id,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    status: data.status ?? 'PENDING',
    ...data,
  })),
  findById: jest
    .fn()
    .mockImplementation((id: string) => ({ id, status: 'PENDING' })),
};

export const mockOrderItemRepository = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  create: jest.fn().mockImplementation((item: any) => ({
    id: 'order-item-id',
    ...item,
  })),
  bulkCreate: jest.fn().mockImplementation((items: any[]) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    items.map((it, i) => ({ id: `order-item-${i}`, ...it })),
  ),
  findById: jest.fn(),
  findByOrderId: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
};

export const mockOrderTaxRepository = {};
export const mockPromotionRedemptionRepository = {};
export const mockZoneRepository = {};

export const mockCategoryRepository = {
  findById: jest.fn(),
};

export const mockUnitOfWork = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
  execute: jest.fn((fn: any) => fn()),
};

export const mockTableSessionRepository = {
  findByToken: jest.fn(),
  findActiveByTableId: jest.fn(),
  create: jest.fn(),
};

export const mockEntityTaxConfigRepository = {
  findByEntity: jest.fn().mockResolvedValue([]),
  findMany: jest.fn(),
};

export const mockTaxRepository = {
  findById: jest.fn(),
  findByIds: jest.fn(),
  findByType: jest.fn().mockResolvedValue([]),
};

export const mockTableSessionGuard = {
  canActivate: jest.fn().mockResolvedValue(true),
};

export const mockSessionPreferenceRepository = {
  findBySessionId: jest.fn().mockResolvedValue(null),
  create: jest.fn(),
  updateBySessionId: jest.fn(),
};

export const mockProductAttributeRepository = {
  findByProductId: jest.fn().mockResolvedValue(null),
  upsert: jest.fn(),
};

export const mockPricingSnapshotRepository = {
  create: jest.fn().mockResolvedValue({ id: 'snapshot-id' }),
  findByOrderId: jest.fn().mockResolvedValue(null),
  deleteByOrderId: jest.fn().mockResolvedValue(undefined),
};

// ─── Global mock module ──────────────────────────────────────────────────────
@Global()
@Module({
  providers: [
    {
      provide: TableSessionConfig,
      useValue: {
        cookie: {
          name: 'session_token',
          httpOnly: true,
          secure: false,
          sameSite: 'Strict',
          path: '/',
        },
        jwt: { secret: 'test-secret', expiresIn: 7 * 24 * 60 * 60 },
      },
    },
    { provide: TableSessionGuard, useValue: mockTableSessionGuard },
    { provide: ProductRepository, useValue: mockProductRepository },
    {
      provide: ProductAttributeRepository,
      useValue: mockProductAttributeRepository,
    },
    { provide: TableRepository, useValue: mockTableRepository },
    { provide: OrderRepository, useValue: mockOrderRepository },
    {
      provide: PricingSnapshotRepository,
      useValue: mockPricingSnapshotRepository,
    },
    { provide: OrderItemRepository, useValue: mockOrderItemRepository },
    {
      provide: EntityTaxConfigRepository,
      useValue: mockEntityTaxConfigRepository,
    },
    { provide: TaxRepository, useValue: mockTaxRepository },
    { provide: OrderTaxRepository, useValue: mockOrderTaxRepository },
    {
      provide: PromotionRedemptionRepository,
      useValue: mockPromotionRedemptionRepository,
    },
    { provide: ZoneRepository, useValue: mockZoneRepository },
    { provide: CategoryRepository, useValue: mockCategoryRepository },
    {
      provide: SessionPreferenceRepository,
      useValue: mockSessionPreferenceRepository,
    },
    { provide: UnitOfWork, useValue: mockUnitOfWork },
    { provide: TableSessionRepository, useValue: mockTableSessionRepository },
  ],
  exports: [
    TableSessionConfig,
    TableSessionGuard,
    SessionPreferenceRepository,
    ProductAttributeRepository,
    ProductRepository,
    TableRepository,
    OrderRepository,
    PricingSnapshotRepository,
    OrderItemRepository,
    OrderTaxRepository,
    PromotionRedemptionRepository,
    ZoneRepository,
    CategoryRepository,
    UnitOfWork,
    TableSessionRepository,
  ],
})
export class GlobalMockRepositoriesModule {}
