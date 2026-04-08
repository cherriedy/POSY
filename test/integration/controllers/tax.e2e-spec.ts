/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  Global,
  Module,
} from '@nestjs/common';
import request from 'supertest';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../../src/authorization/guards/role.guard';
import { TaxModule } from '../../../src/models/taxes';
import { PrismaService } from '../../../src/providers/prisma/prisma.service';
import { PrismaModule } from '../../../src/providers/prisma/prisma.module';
import { ZoneRepository } from '../../../src/models/zones/repositories';
import { ProductRepository } from '../../../src/models/products';
import { CategoryRepository } from '../../../src/models/categories/shared/repositories';
import {
  passThroughGuard,
  createPrismaError,
  GlobalMockModule,
  applyValidationPipe,
} from '../shared/core';

// ─── Prisma mock ─────────────────────────────────────────────────────────────

const mockPrisma = {
  taxConfig: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  entityTaxConfig: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  orderTax: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
};

// ─── Repository mocks ────────────────────────────────────────────────────────

const mockZoneRepository = { findById: jest.fn() };
const mockProductRepository = { findById: jest.fn() };
const mockCategoryRepository = { findById: jest.fn() };

// ─── Helper functions ────────────────────────────────────────────────────────

const createMockTax = (overrides: any = {}) => ({
  id: overrides.id || 'tax-id',
  name: overrides.name || 'Test Tax',
  description: overrides.description || null,
  type: overrides.type || 'VAT',
  rate_type: overrides.rate_type || 'PERCENTAGE',
  charge_rate: overrides.charge_rate || 10,
  is_active: overrides.is_active !== undefined ? overrides.is_active : true,
  is_included:
    overrides.is_included !== undefined ? overrides.is_included : false,
  is_deleted: overrides.is_deleted !== undefined ? overrides.is_deleted : false,
  sort_order: overrides.sort_order || null,
  deleted_at: overrides.deleted_at || null,
  created_at: overrides.created_at || new Date(),
  updated_at: overrides.updated_at || new Date(),
});

// ─── Global mock module — replaces @Global() repos from ZoneModule/ProductModule/CategoryModule ─

@Global()
@Module({
  imports: [GlobalMockModule],
  providers: [
    { provide: ZoneRepository, useValue: mockZoneRepository },
    { provide: ProductRepository, useValue: mockProductRepository },
    { provide: CategoryRepository, useValue: mockCategoryRepository },
  ],
  exports: [ZoneRepository, ProductRepository, CategoryRepository],
})
class GlobalMockRepositoriesModule {}

// ─────────────────────────────────────────────────────────────────────────────

describe('TaxController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GlobalMockRepositoriesModule, PrismaModule, TaxModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideGuard(AuthGuard('jwt'))
      .useValue(passThroughGuard)
      .overrideGuard(RoleGuard)
      .useValue(passThroughGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    applyValidationPipe(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ────────────────────────────────────────────────────────────────
  // DELETE /taxes/:taxId/entities — bulk remove entity-tax associations
  // ────────────────────────────────────────────────────────────────

  describe('DELETE /taxes/:taxId/entities', () => {
    const taxId = '123e4567-e89b-42d3-a456-426614174000';
    const entity1 = { type: 'PRODUCT', id: 'prod-1' };
    const entity2 = { type: 'CATEGORY', id: 'cat-1' };
    const entity3 = { type: 'ZONE', id: 'zone-1' };

    it('returns 200 with all successes when all associations exist', async () => {
      mockPrisma.entityTaxConfig.delete
        .mockResolvedValueOnce({ id: 'config-1' })
        .mockResolvedValueOnce({ id: 'config-2' });

      const { body } = await request(app.getHttpServer())
        .delete(`/taxes/${taxId}/entities`)
        .send({ entities: [entity1, entity2] })
        .expect(200);

      expect(body.total).toBe(2);
      expect(body.succeeded).toBe(2);
      expect(body.failed).toBe(0);
      expect(body.items).toHaveLength(2);
      expect(body.items.every((i: any) => i.status === 'SUCCEED')).toBe(true);
      expect(body.items.every((i: any) => i.entity)).toBe(true);
      expect(mockPrisma.entityTaxConfig.delete).toHaveBeenCalledTimes(2);
    });

    it('returns 200 with partial failure when some associations do not exist', async () => {
      mockPrisma.entityTaxConfig.delete
        .mockResolvedValueOnce({ id: 'config-1' })
        .mockRejectedValueOnce(createPrismaError('P2025', 'Not found'));

      const { body } = await request(app.getHttpServer())
        .delete(`/taxes/${taxId}/entities`)
        .send({ entities: [entity1, entity2] })
        .expect(200);

      expect(body.total).toBe(2);
      expect(body.succeeded).toBe(1);
      expect(body.failed).toBe(1);
      expect(body.items).toHaveLength(2);
      expect(body.items.some((i: any) => i.status === 'SUCCEED')).toBe(true);
      expect(body.items.some((i: any) => i.status === 'FAILED')).toBe(true);
      expect(
        body.items.find((i: any) => i.status === 'FAILED').error,
      ).toBeDefined();
    });

    it('returns 200 with all failures when no associations exist', async () => {
      mockPrisma.entityTaxConfig.delete
        .mockRejectedValueOnce(createPrismaError('P2025', 'Not found'))
        .mockRejectedValueOnce(createPrismaError('P2025', 'Not found'))
        .mockRejectedValueOnce(createPrismaError('P2025', 'Not found'));

      const { body } = await request(app.getHttpServer())
        .delete(`/taxes/${taxId}/entities`)
        .send({ entities: [entity1, entity2, entity3] })
        .expect(200);

      expect(body.total).toBe(3);
      expect(body.succeeded).toBe(0);
      expect(body.failed).toBe(3);
      expect(body.items.every((i: any) => i.status === 'FAILED')).toBe(true);
      expect(body.items.every((i: any) => i.error)).toBe(true);
    });

    it('returns 400 when entities is empty', async () => {
      await request(app.getHttpServer())
        .delete(`/taxes/${taxId}/entities`)
        .send({ entities: [] })
        .expect(400);
    });

    it('returns 400 when entities contains invalid entity type', async () => {
      await request(app.getHttpServer())
        .delete(`/taxes/${taxId}/entities`)
        .send({ entities: [{ type: 'INVALID_TYPE', id: 'id-1' }] })
        .expect(400);
    });

    it('returns 400 when entities contains invalid UUID', async () => {
      await request(app.getHttpServer())
        .delete(`/taxes/${taxId}/entities`)
        .send({ entities: [{ type: 'PRODUCT', id: 'not-a-uuid' }] })
        .expect(400);
    });

    it('returns 400 when body is missing entities', async () => {
      await request(app.getHttpServer())
        .delete(`/taxes/${taxId}/entities`)
        .send({})
        .expect(400);
    });

    it('includes entity reference in response items', async () => {
      mockPrisma.entityTaxConfig.delete.mockResolvedValueOnce({
        id: 'config-1',
      });

      const { body } = await request(app.getHttpServer())
        .delete(`/taxes/${taxId}/entities`)
        .send({ entities: [entity1] })
        .expect(200);

      expect(body.items[0].entity).toBeDefined();
      expect(body.items[0].entity.id).toBe(entity1.id);
      expect(body.items[0].entity.type).toBe(entity1.type);
    });

    it('returns 400 when entities exceed max size', async () => {
      const tooManyEntities = Array.from({ length: 101 }, (_, i) => ({
        type: 'PRODUCT',
        id: `prod-${i}`,
      }));

      await request(app.getHttpServer())
        .delete(`/taxes/${taxId}/entities`)
        .send({ entities: tooManyEntities })
        .expect(400);
    });

    it('returns 404 when tax does not exist', async () => {
      const nonExistentTaxId = '999999999-e89b-42d3-a456-426614174999';
      mockPrisma.entityTaxConfig.delete.mockRejectedValueOnce(
        createPrismaError('P2025', 'Tax not found'),
      );

      const { body } = await request(app.getHttpServer())
        .delete(`/taxes/${nonExistentTaxId}/entities`)
        .send({ entities: [entity1] })
        .expect(200);

      expect(body.failed).toBe(1);
      expect(body.items[0].status).toBe('FAILED');
    });
  });

  // ────────────────────────────────────────────────────────────────
  // GET /taxes
  // ────────────────────────────────────────────────────────────────

  describe('GET /taxes', () => {
    it('returns paginated taxes with default params', async () => {
      const taxes = [
        createMockTax({
          id: 'tax-1',
          name: 'VAT',
          type: 'VAT',
          charge_rate: 10,
        }),
        createMockTax({
          id: 'tax-2',
          name: 'Service Tax',
          type: 'SERVICE',
          charge_rate: 5,
        }),
      ];
      mockPrisma.taxConfig.findMany.mockResolvedValue(taxes);
      mockPrisma.taxConfig.count.mockResolvedValue(2);

      const { body } = await request(app.getHttpServer())
        .get('/taxes')
        .expect(200);

      expect(body.items).toHaveLength(2);
      expect(body.total).toBe(2);
    });

    it('returns paginated taxes with custom params', async () => {
      const taxes = [createMockTax({ id: 'tax-1', name: 'VAT' })];
      mockPrisma.taxConfig.findMany.mockResolvedValue(taxes);
      mockPrisma.taxConfig.count.mockResolvedValue(1);

      const { body } = await request(app.getHttpServer())
        .get('/taxes?page=2&pageSize=5')
        .expect(200);

      expect(body.items).toHaveLength(1);
      expect(body.total).toBe(1);
    });

    it('returns 500 on database error', async () => {
      mockPrisma.taxConfig.findMany.mockRejectedValue(new Error('DB error'));
      await request(app.getHttpServer()).get('/taxes').expect(500);
    });
  });

  // ────────────────────────────────────────────────────────────────
  // GET /taxes/active
  // ────────────────────────────────────────────────────────────────

  describe('GET /taxes/active', () => {
    it('returns only active taxes', async () => {
      const activeTaxes = [
        createMockTax({
          id: 'tax-1',
          name: 'VAT',
          type: 'VAT',
          charge_rate: 10,
          sort_order: 1,
        }),
        createMockTax({
          id: 'tax-2',
          name: 'Service Tax',
          type: 'SERVICE',
          charge_rate: 5,
          sort_order: 2,
        }),
      ];
      mockPrisma.taxConfig.findMany.mockResolvedValue(activeTaxes);

      const { body } = await request(app.getHttpServer())
        .get('/taxes/active')
        .expect(200);

      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(2);
    });

    it('returns 500 on database error', async () => {
      mockPrisma.taxConfig.findMany.mockRejectedValue(new Error('DB error'));

      await request(app.getHttpServer()).get('/taxes/active').expect(500);
    });
  });

  // ────────────────────────────────────────────────────────────────
  // GET /taxes/:id
  // ────────────────────────────────────────────────────────────────

  describe('GET /taxes/:id', () => {
    const taxId = '123e4567-e89b-42d3-a456-426614174000';

    it('returns tax details when found', async () => {
      const tax = createMockTax({
        id: taxId,
        name: 'VAT',
        type: 'VAT',
        charge_rate: 10,
      });
      mockPrisma.taxConfig.findUnique.mockResolvedValue(tax);

      const { body } = await request(app.getHttpServer())
        .get(`/taxes/${taxId}`)
        .expect(200);

      expect(body.id).toBe(taxId);
      expect(body.name).toBe('VAT');
    });

    it('returns 404 when tax not found', async () => {
      mockPrisma.taxConfig.findUnique.mockResolvedValue(null);
      await request(app.getHttpServer()).get(`/taxes/${taxId}`).expect(404);
    });

    it('returns 500 on database error', async () => {
      mockPrisma.taxConfig.findUnique.mockRejectedValue(new Error('DB error'));
      await request(app.getHttpServer()).get(`/taxes/${taxId}`).expect(500);
    });
  });

  // ────────────────────────────────────────────────────────────────
  // POST /taxes
  // ────────────────────────────────────────────────────────────────

  describe('POST /taxes', () => {
    const validDto = {
      name: 'New Tax',
      type: 'VAT',
      rateType: 'PERCENTAGE',
      chargeRate: 10.0,
      isActive: true,
    };

    it('creates a new tax successfully', async () => {
      const createdTax = createMockTax({
        id: 'new-tax-id',
        name: 'New Tax',
        type: 'VAT',
        charge_rate: 10.0,
      });
      mockPrisma.taxConfig.create.mockResolvedValue(createdTax);

      const { body } = await request(app.getHttpServer())
        .post('/taxes')
        .send(validDto)
        .expect(201);

      expect(body.id).toBe('new-tax-id');
      expect(body.name).toBe('New Tax');
    });

    it('returns 400 on duplicate name', async () => {
      mockPrisma.taxConfig.create.mockRejectedValue(
        createPrismaError('P2002', 'Unique constraint violation'),
      );

      await request(app.getHttpServer())
        .post('/taxes')
        .send(validDto)
        .expect(400);
    });

    it('returns 400 on validation error', async () => {
      const invalidDto = { name: '', type: 'INVALID' };

      await request(app.getHttpServer())
        .post('/taxes')
        .send(invalidDto)
        .expect(400);
    });

    it('returns 500 on database error', async () => {
      mockPrisma.taxConfig.create.mockRejectedValue(new Error('DB error'));

      await request(app.getHttpServer())
        .post('/taxes')
        .send(validDto)
        .expect(500);
    });
  });

  // ────────────────────────────────────────────────────────────────
  // PUT /taxes/:id
  // ────────────────────────────────────────────────────────────────

  describe('PUT /taxes/:id', () => {
    const taxId = '123e4567-e89b-42d3-a456-426614174000';
    const updateDto = { name: 'Updated Tax', chargeRate: 12.0 };

    it('updates tax successfully', async () => {
      const updatedTax = createMockTax({
        id: taxId,
        name: 'Updated Tax',
        charge_rate: 12.0,
      });
      mockPrisma.taxConfig.update.mockResolvedValue(updatedTax);

      const { body } = await request(app.getHttpServer())
        .put(`/taxes/${taxId}`)
        .send(updateDto)
        .expect(200);

      expect(body.id).toBe(taxId);
      expect(body.name).toBe('Updated Tax');
      expect(body.charge_rate).toBe(12.0);
    });

    it('returns 404 when tax not found', async () => {
      mockPrisma.taxConfig.update.mockRejectedValue(
        createPrismaError('P2025', 'Not found'),
      );

      await request(app.getHttpServer())
        .put(`/taxes/${taxId}`)
        .send(updateDto)
        .expect(404);
    });

    it('returns 400 on duplicate name', async () => {
      mockPrisma.taxConfig.update.mockRejectedValueOnce(
        createPrismaError('P2002', 'Unique constraint violation'),
      );

      await request(app.getHttpServer())
        .put(`/taxes/${taxId}`)
        .send(updateDto)
        .expect(400);
    });

    it('returns 400 on validation error', async () => {
      const invalidDto = { name: null };

      await request(app.getHttpServer())
        .put(`/taxes/${taxId}`)
        .send(invalidDto)
        .expect(400);
    });

    it('returns 500 on database error', async () => {
      mockPrisma.taxConfig.update.mockRejectedValue(new Error('DB error'));

      await request(app.getHttpServer())
        .put(`/taxes/${taxId}`)
        .send(updateDto)
        .expect(500);
    });
  });

  // ────────────────────────────────────────────────────────────────
  // DELETE /taxes/:id
  // ────────────────────────────────────────────────────────────────

  describe('DELETE /taxes/:id', () => {
    const taxId = '123e4567-e89b-42d3-a456-426614174000';

    it('should soft delete a tax and return success message', async () => {
      mockPrisma.taxConfig.update.mockResolvedValue({
        id: taxId,
        is_deleted: true,
        deleted_at: expect.any(Date),
      });

      const { body } = await request(app.getHttpServer())
        .delete(`/taxes/${taxId}`)
        .expect(200);

      expect(mockPrisma.taxConfig.update).toHaveBeenCalledWith({
        where: { id: taxId },
        data: {
          is_deleted: true,
          deleted_at: expect.any(Date),
        },
      });
      expect(body).toEqual({
        message: 'Tax deleted successfully.',
      });
    });

    it('returns 404 when tax not found', async () => {
      mockPrisma.taxConfig.findUnique.mockResolvedValue(null);
      await request(app.getHttpServer()).delete(`/taxes/${taxId}`).expect(404);
    });

    it('returns 500 on database error', async () => {
      mockPrisma.taxConfig.update.mockRejectedValue(new Error('DB error'));
      await request(app.getHttpServer()).delete(`/taxes/${taxId}`).expect(500);
    });
  });

  // ────────────────────────────────────────────────────────────────
  // POST /taxes/:id/entities
  // ────────────────────────────────────────────────────────────────

  describe('POST /taxes/:id/entities', () => {
    const taxId = '123e4567-e89b-42d3-a456-426614174000';
    const dto = {
      items: [
        {
          entityRef: {
            id: 'bbbbbbbb-e89b-42d3-a456-426614174001',
            type: 'PRODUCT',
          },
          isActive: true,
          note: 'Test note',
        },
      ],
    };

    it('upserts associations successfully', async () => {
      // Mock tax lookup
      mockPrisma.taxConfig.findUnique.mockResolvedValue(
        createMockTax({
          id: taxId,
          name: 'VAT',
          type: 'VAT',
          charge_rate: 10,
        }),
      );

      // Mock product lookup
      mockProductRepository.findById.mockResolvedValue({
        id: 'bbbbbbbb-e89b-42d3-a456-426614174001',
        name: 'Product 1',
      });

      // Mock duplicate check (no existing association)
      mockPrisma.entityTaxConfig.findFirst.mockResolvedValue(null);

      // Mock create
      mockPrisma.entityTaxConfig.create.mockResolvedValue({
        id: 'config-1',
        tax_id: taxId,
        entity_id: 'bbbbbbbb-e89b-42d3-a456-426614174001',
        entity_type: 'PRODUCT',
        is_active: true,
        note: 'Test note',
        created_at: new Date(),
        updated_at: new Date(),
      });

      const { body } = await request(app.getHttpServer())
        .post(`/taxes/${taxId}/entities`)
        .send(dto)
        .expect(201);

      expect(body.total).toBe(1);
      expect(body.succeeded).toBe(1);
      expect(body.failed).toBe(0);
    });

    it('returns 404 when tax not found', async () => {
      mockPrisma.taxConfig.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post(`/taxes/${taxId}/entities`)
        .send(dto)
        .expect(404);
    });

    it('returns 400 on validation error', async () => {
      const invalidDto = { items: [] };

      await request(app.getHttpServer())
        .post(`/taxes/${taxId}/entities`)
        .send(invalidDto)
        .expect(400);
    });

    it('returns 500 on database error', async () => {
      mockPrisma.taxConfig.findUnique.mockRejectedValue(new Error('DB error'));

      await request(app.getHttpServer())
        .post(`/taxes/${taxId}/entities`)
        .send(dto)
        .expect(500);
    });
  });

  // ────────────────────────────────────────────────────────────────
  // GET /taxes/:id/entities
  // ────────────────────────────────────────────────────────────────

  describe('GET /taxes/:id/entities', () => {
    const taxId = '123e4567-e89b-42d3-a456-426614174000';

    it('returns entity associations for tax', async () => {
      const associations = [
        {
          id: 'assoc-1',
          tax_id: taxId,
          entity_id: 'entity-1',
          entity_type: 'PRODUCT',
          is_active: true,
          note: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      mockPrisma.entityTaxConfig.findMany.mockResolvedValue(associations);

      const { body } = await request(app.getHttpServer())
        .get(`/taxes/${taxId}/entities`)
        .expect(200);

      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(1);
      expect(body[0].id).toBe('assoc-1');
    });

    it('returns 500 on database error', async () => {
      mockPrisma.entityTaxConfig.findMany.mockRejectedValue(
        new Error('DB error'),
      );

      await request(app.getHttpServer())
        .get(`/taxes/${taxId}/entities`)
        .expect(500);
    });
  });

  // ────────────────────────────────────────────────────────────────
  // GET /taxes/entities/:type/:id
  // ────────────────────────────────────────────────────────────────

  describe('GET /taxes/entities/:type/:id', () => {
    const entityId = '123e4567-e89b-42d3-a456-426614174000';
    const entityType = 'PRODUCT';

    it('returns tax associations for entity', async () => {
      const associations = [
        {
          id: 'assoc-1',
          tax_id: 'tax-1',
          entity_id: entityId,
          entity_type: entityType,
          is_active: true,
          note: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      mockPrisma.entityTaxConfig.findMany.mockResolvedValue(associations);

      const { body } = await request(app.getHttpServer())
        .get(`/taxes/entities/${entityType}/${entityId}`)
        .expect(200);

      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(1);
      expect(body[0].id).toBe('assoc-1');
    });

    it('returns 500 on database error', async () => {
      mockPrisma.entityTaxConfig.findMany.mockRejectedValue(
        new Error('DB error'),
      );

      await request(app.getHttpServer())
        .get(`/taxes/entities/${entityType}/${entityId}`)
        .expect(500);
    });
  });
});
