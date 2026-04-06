/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { execSync } from 'child_process';
import { PrismaService } from '../../src/providers/prisma/prisma.service';
import { applyValidationPipe } from '../integration/shared/core';
import { AppModule } from '../../src/app.module';
import { ProductRepository } from '../../src/models/products';
import { Product } from '../../src/models/products';
import { TableRepository } from '../../src/models/tables/repositories';
import { FloorRepository } from '../../src/models/floors/repositories';
import { ZoneRepository } from '../../src/models/zones/repositories';
import { Floor } from '../../src/models/floors/types';
import { Zone } from '../../src/models/zones/types';
import { Table } from '../../src/models/tables/types';
import { TableStatus } from '../../src/models/tables/enums';
import { CategoryRepository } from '../../src/models/categories/shared/repositories';
import { Category } from '../../src/models/categories/shared/entities';

describe('GuestOrder (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let prisma: PrismaService;
  let productRepository: ProductRepository;
  let tableRepository: TableRepository;
  let floorRepository: FloorRepository;
  let zoneRepository: ZoneRepository;
  let categoryRepository: CategoryRepository;

  beforeAll(async () => {
    process.env.DATABASE_URL =
      'postgresql://postgres:postgres@localhost:5433/posy_e2e?schema=public';

    try {
      execSync('npx prisma db push --schema=src/database/schema.prisma', {
        stdio: 'inherit',
      });
      execSync('npx prisma db seed --schema=src/database/schema.prisma', {
        stdio: 'inherit',
      });
    } catch (e) {
      if (e instanceof Error) {
        console.error(
          `There was an error setting up the test database. Please ensure that PostgreSQL 
        is running and accessible at the configured URL, and that the Prisma CLI is installed. 
        Error details: ${e.message}`,
          e.stack,
        );
      }
      throw e;
    }

    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use((req: any, _res: any, next: any) => {
      req['device'] = 'e2e-test-device';
      next();
    });
    applyValidationPipe(app);
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    productRepository = moduleFixture.get<ProductRepository>(ProductRepository);
    tableRepository = moduleFixture.get<TableRepository>(TableRepository);
    floorRepository = moduleFixture.get<FloorRepository>(FloorRepository);
    zoneRepository = moduleFixture.get<ZoneRepository>(ZoneRepository);
    categoryRepository =
      moduleFixture.get<CategoryRepository>(CategoryRepository);
  });

  beforeEach(async () => {
    await prisma.orderItem.deleteMany().catch(() => {});
    await prisma.order.deleteMany().catch(() => {});
    await prisma.tableSession.deleteMany().catch(() => {});
    await prisma.product.deleteMany().catch(() => {});
    await prisma.table.deleteMany().catch(() => {});
    await prisma.zone.deleteMany().catch(() => {});
    await prisma.floor.deleteMany().catch(() => {});
    await prisma.category.deleteMany().catch(() => {});
  });

  afterAll(async () => {
    if (prisma) await prisma.$disconnect().catch(() => {}); // disconnect Prisma client
    if (app) await app.close(); // close the Nest application
  });

  describe('POST /orders', () => {
    it('creates a new order for a guest user successfully', async () => {
      const category = await categoryRepository.create(
        new Category(
          null,
          'Pizzas',
          `pizzas-${Date.now()}`,
          'Delicious pizzas',
          true,
          false,
          null,
          null,
          null,
        ),
      );

      const product = await productRepository.create(
        new Product(
          null,
          category.id,
          null,
          'Margherita Pizza',
          'margherita-pizza',
          'Classic pizza with tomato sauce and cheese',
          10.99,
          null,
          null,
          null,
          100,
          true,
          false,
          null,
          null,
          null,
          undefined,
        ),
      );

      const floor = await floorRepository.create(
        new Floor(null, 'Main Floor', 1, true, null, null, null),
      );

      const zone = await zoneRepository.create(
        new Zone(
          null,
          'Zone A',
          'A cozy corner',
          true,
          floor.id!,
          null,
          null,
          null,
          null,
        ),
      );

      const table = await tableRepository.create(
        new Table(
          null,
          zone.id,
          'Table 1',
          4,
          TableStatus.AVAILABLE,
          null,
          null,
          true,
          null,
          null,
          null,
        ),
      );

      const createOrderDto = {
        items: [{ productId: product.id, quantity: 2, note: 'Extra cheese' }],
        note: 'Please make it quick, we are in a hurry!',
      };

      const sessionRes = await request(app.getHttpServer())
        .post('/session')
        .send({ tableId: table.id });

      expect(sessionRes.status).toBe(200);
      const cookie = sessionRes.headers['set-cookie'];

      const orderRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Cookie', cookie)
        .send(createOrderDto);

      expect(orderRes.status).toBe(201);
      expect(orderRes.body).toHaveProperty('id');
      expect(orderRes.body.status).toBe('PENDING');
    });
  });
});
