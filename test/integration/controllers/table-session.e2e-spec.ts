/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Global, Module } from '@nestjs/common';
import request from 'supertest';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../../src/authorization/guards/role.guard';
import { TableSessionModule } from '../../../src/models/table-sessions';
import { PrismaService } from '../../../src/providers/prisma/prisma.service';
import { PrismaModule } from '../../../src/providers/prisma/prisma.module';
import { TableRepository } from '../../../src/models/tables/repositories';
import {
  passThroughGuard,
  GlobalMockModule,
  applyValidationPipe,
} from '../shared/core';

// ─── Prisma mock ─────────────────────────────────────────────────────────────

const mockPrisma = {
  tableSession: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  table: {
    findUnique: jest.fn(),
  },
};

// ─── Repository mocks ────────────────────────────────────────────────────────

const mockTableRepository = {
  findById: jest.fn(),
};

// ─── Global mock module ──────────────────────────────────────────────────────

@Global()
@Module({
  imports: [GlobalMockModule],
  providers: [{ provide: TableRepository, useValue: mockTableRepository }],
  exports: [TableRepository],
})
class GlobalMockRepositoriesModule {}

// ─────────────────────────────────────────────────────────────────────────────

describe('TableSessionController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GlobalMockRepositoriesModule, PrismaModule, TableSessionModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideGuard(AuthGuard('jwt'))
      .useValue(passThroughGuard)
      .overrideGuard(RoleGuard)
      .useValue(passThroughGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use((req, res, next) => {
      req['device'] = 'desktop';
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
  // POST /session
  // ────────────────────────────────────────────────────────────────

  describe('POST /session', () => {
    const tableId = 'c1b3a3d0-5b6f-4b8a-8c1a-9b4a2d1c3e5f';
    const startSessionDto = { tableId };

    it('starts a new session successfully', async () => {
      mockPrisma.table.findUnique.mockResolvedValue({
        id: tableId,
        name: 'Table 1',
      });
      mockTableRepository.findById.mockResolvedValue({
        id: tableId,
        name: 'Table 1',
        isActive: true,
      });
      mockPrisma.tableSession.findFirst.mockResolvedValue(null);
      mockPrisma.tableSession.create.mockResolvedValue({
        id: 'session-id-123',
        status: 'ACTIVE',
        table_id: tableId,
        start_at: new Date(),
        table: {
          id: tableId,
          name: 'Table 1',
        },
      });

      const res = await request(app.getHttpServer())
        .post('/session')
        .send(startSessionDto);

      if (res.status !== 200) {
        console.error('HTTP ERROR:', {
          status: res.status,
          body: res.body,
          text: res.text,
          headers: res.headers,
        });
      }

      expect(res.status).toBe(200);

      const { body, headers } = res;

      expect(body.id).toBe('session-id-123');
      expect(body.status).toBe('ACTIVE');
      expect(body.table.id).toBe(tableId);
      expect(headers['set-cookie']).toBeDefined();
    });

    it('returns 400 if tableId is not a UUID', async () => {
      await request(app.getHttpServer())
        .post('/session')
        .send({ tableId: 'not-a-uuid' })
        .expect(400);
    });

    it('returns 400 if an active session already exists', async () => {
      mockPrisma.table.findUnique.mockResolvedValue({
        id: tableId,
        name: 'Table 1',
      });
      mockTableRepository.findById.mockResolvedValue({
        id: tableId,
        name: 'Table 1',
        isActive: true,
      });
      mockPrisma.tableSession.findFirst.mockResolvedValue({
        id: 'existing-session',
      });

      await request(app.getHttpServer())
        .post('/session')
        .send(startSessionDto)
        .expect(400);
    });
  });
});
