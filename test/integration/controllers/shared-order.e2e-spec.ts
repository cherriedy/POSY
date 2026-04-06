/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../../src/authorization/guards/role.guard';
import { PrismaService } from '../../../src/providers/prisma/prisma.service';
import { PrismaModule } from '../../../src/providers/prisma/prisma.module';
import {
  passThroughGuard,
  applyValidationPipe,
  GlobalMockModule,
} from '../shared/core';
import {
  GlobalMockRepositoriesModule,
  mockPrisma,
  mockProductRepository,
  mockTableRepository,
  mockOrderRepository,
  mockOrderItemRepository,
  mockEntityTaxConfigRepository,
  mockTaxRepository,
  mockUnitOfWork,
  mockTableSessionRepository,
  mockPricingSnapshotRepository,
} from '../shared/repositories';
import { UnitOfWork } from '../../../src/common/unit-of-works';
import {
  OrderRepository,
  OrderItemRepository,
  PricingSnapshotRepository,
} from '../../../src/models/orders/shared/repositories';
import { OrderModule } from '../../../src/models/orders';
import { SessionOrJwtGuard } from '../../../src/common/guards';
import {
  EntityTaxConfigRepository,
  TaxRepository,
} from '../../../src/models/taxes';

describe('SharedOrderController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        GlobalMockModule,
        GlobalMockRepositoriesModule,
        PrismaModule,
        OrderModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(EntityTaxConfigRepository)
      .useValue(mockEntityTaxConfigRepository)
      .overrideProvider(TaxRepository)
      .useValue(mockTaxRepository)
      .overrideProvider(PricingSnapshotRepository)
      .useValue(mockPricingSnapshotRepository)
      .overrideProvider(OrderRepository)
      .useValue(mockOrderRepository)
      .overrideProvider(OrderItemRepository)
      .useValue(mockOrderItemRepository)
      .overrideProvider(UnitOfWork)
      .useValue(mockUnitOfWork)
      .overrideGuard(AuthGuard('jwt'))
      .useValue(passThroughGuard)
      .overrideGuard(RoleGuard)
      .useValue(passThroughGuard)
      .overrideGuard(SessionOrJwtGuard)
      .useValue(passThroughGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    // simulate device, session cookie, and auth user for tests
    app.use((req: any, _res: any, next: any) => {
      // device fingerprint expected by session guards
      req['device'] = 'desktop';
      // simulate session from cookie if present
      const cookieHeader =
        req.headers && (req.headers.cookie || req.headers.Cookie);
      const cookieStr = Array.isArray(cookieHeader)
        ? cookieHeader.join(';')
        : cookieHeader || '';
      const match = /session_token=([^;]+)/.exec(cookieStr);
      if (match) {
        const sessionToken = match[1];
        // attach a minimal session object expected by @CurrentSession decorator
        req.session = {
          id: sessionToken,
          tableId: 'c1b3a3d0-5b6f-4b8a-8c1a-9b4a2d1c3e5f',
          table: {
            id: 'c1b3a3d0-5b6f-4b8a-8c1a-9b4a2d1c3e5f',
            name: 'Table 1',
          },
        };
      }
      // simulate JWT-authenticated user when Authorization header provided
      if (req.headers && req.headers.authorization) {
        req.user = { sub: 'staff-user-1' };
      }
      next();
    });
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
  // POST /orders
  // ────────────────────────────────────────────────────────────────

  describe('POST /orders', () => {
    const tableId = 'c1b3a3d0-5b6f-4b8a-8c1a-9b4a2d1c3e5f';
    const sessionId = 'bba4af34-f413-4d3e-b623-f4b9c39b916b';
    const productId = 'a1b2c3d4-e5f6-41d0-8123-456789abcdef';
    const createOrderDto = {
      items: [{ productId, quantity: 2, note: 'Extra cheese' }],
      note: 'Urgent',
    };

    it('creates a new order for a guest user successfully', async () => {
      mockTableRepository.findById.mockResolvedValue({
        id: tableId,
        name: 'Table 1',
        isActive: true,
      });
      // Order flow resolves products via `findById` (see OrderContextService.getRequiredProducts)
      mockProductRepository.findById.mockResolvedValue({
        id: productId,
        name: 'Pizza',
        price: 10.99,
      });
      mockProductRepository.getByIds.mockResolvedValue([
        { id: productId, name: 'Pizza', price: 10.99 },
      ]);
      mockOrderRepository.create.mockResolvedValue({
        id: 'new-order-id',
        status: 'PENDING',
        table: { id: tableId, name: 'Table 1' },
        items: [{ product: { id: productId }, quantity: 2 }],
      });

      const res = await request(app.getHttpServer())
        .post('/orders')
        .set('Cookie', `session_token=${sessionId}`)
        .send(createOrderDto);

      expect(res.status).toBe(201);
      expect(res.body.id).toBe('new-order-id');
      expect(res.body.status).toBe('PENDING');
    });

    it('creates a new order for a staff user successfully', async () => {
      mockTableRepository.findById.mockResolvedValue({
        id: tableId,
        name: 'Table 1',
        isActive: true,
      });
      // Order flow resolves products via `findById`
      mockProductRepository.findById.mockResolvedValue({
        id: productId,
        name: 'Pizza',
        price: 10.99,
      });
      mockProductRepository.getByIds.mockResolvedValue([
        { id: productId, name: 'Pizza', price: 10.99 },
      ]);
      mockOrderRepository.create.mockResolvedValue({
        id: 'new-order-id',
        status: 'PENDING',
        table: { id: tableId, name: 'Table 1' },
        items: [{ product: { id: productId }, quantity: 2 }],
      });
      mockPrisma.tableSession.findFirst.mockResolvedValue({ id: sessionId });
      // When staff creates a session, the StaffSessionContextService will call
      // tableSessionRepository.create and expect an object with id and tableId.
      mockTableSessionRepository.create.mockResolvedValue({
        id: sessionId,
        tableId,
      });

      const res = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', 'Bearer fake-jwt')
        .send({ ...createOrderDto, tableId });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe('new-order-id');
    });

    it('returns 400 if tableId is missing for a staff user', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', 'Bearer fake-jwt')
        .send(createOrderDto)
        .expect(400);
    });

    it('returns 401 if no session or auth is provided', async () => {
      const res = await request(app.getHttpServer())
        .post('/orders')
        .send(createOrderDto);
      expect(res.status).toBe(401);
    });

    it('returns 400 if items array is empty', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .set('Cookie', `session_token=${sessionId}`)
        .send({ ...createOrderDto, items: [] })
        .expect(400);
    });

    it('returns 400 if product is not found', async () => {
      mockTableRepository.findById.mockResolvedValue({
        id: tableId,
        name: 'Table 1',
        isActive: true,
      });
      mockProductRepository.getByIds.mockResolvedValue([]);
      mockProductRepository.findById.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/orders')
        .set('Cookie', `session_token=${sessionId}`)
        .send(createOrderDto)
        .expect(400);
    });

    it('returns 400 if table is not found', async () => {
      mockTableRepository.findById.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', 'Bearer fake-jwt')
        .send({ ...createOrderDto, tableId })
        .expect(400);
    });
  });
});
