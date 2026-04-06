/* eslint-disable */
import 'reflect-metadata';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../authorization/guards/role.guard';

import { TaxController } from './tax.controller';
import { GetTaxesService } from './get-taxes';
import { CreateTaxService } from './create-tax';
import { UpdateTaxService } from './update-tax';
import { DeleteTaxService } from './delete-tax';
import { AssociateEntityTaxService } from './associate-entity-tax';
import { GetEntityTaxAssociationsService } from './get-entity-tax-associations';
import { RemoveEntityTaxAssociationService } from './remove-entity-tax-association';

import { TaxNotFoundException } from './exceptions';
import { DuplicateEntryException } from '../../common/exceptions';

import {
  TaxCreateRequestDto,
  TaxUpdateRequestDto,
  TaxQueryParamsDto,
} from './dto';
import { TaxAssociationBulkUpsertRequestDto } from './dto';
import { EntityType } from './enums';
import { Role } from '../../common/enums';

// ─── Helpers ────────────────────────────────────────────────────────────────

const mockLogger = { error: jest.fn(), log: jest.fn(), warn: jest.fn() };

// ─── Guard mock ──────────────────────────────────────────────────────────────

const passThroughGuard: CanActivate = {
  canActivate: (_ctx: ExecutionContext) => true,
};

// ─── Service mocks ───────────────────────────────────────────────────────────

const mockGetTaxesService = {
  getAll: jest.fn(),
  getById: jest.fn(),
  getAllActive: jest.fn(),
};
const mockCreateTaxService = { create: jest.fn() };
const mockUpdateTaxService = { update: jest.fn() };
const mockDeleteTaxService = { delete: jest.fn() };
const mockAssociateEntityTaxService = { bulkUpsert: jest.fn() };
const mockGetEntityTaxAssociationsService = {
  getByTaxId: jest.fn(),
  getByEntity: jest.fn(),
};
const mockRemoveEntityTaxAssociationService = { bulkRemove: jest.fn() };

// ─── Test suite ──────────────────────────────────────────────────────────────

describe('TaxController', () => {
  let controller: TaxController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaxController],
      providers: [
        { provide: WINSTON_MODULE_NEST_PROVIDER, useValue: mockLogger },
        { provide: GetTaxesService, useValue: mockGetTaxesService },
        { provide: CreateTaxService, useValue: mockCreateTaxService },
        { provide: UpdateTaxService, useValue: mockUpdateTaxService },
        { provide: DeleteTaxService, useValue: mockDeleteTaxService },
        {
          provide: AssociateEntityTaxService,
          useValue: mockAssociateEntityTaxService,
        },
        {
          provide: GetEntityTaxAssociationsService,
          useValue: mockGetEntityTaxAssociationsService,
        },
        {
          provide: RemoveEntityTaxAssociationService,
          useValue: mockRemoveEntityTaxAssociationService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(passThroughGuard)
      .overrideGuard(RoleGuard)
      .useValue(passThroughGuard)
      .compile();

    controller = module.get<TaxController>(TaxController);
  });

  // ────────────────────────────────────────────────────────────────
  // GET /taxes
  // ────────────────────────────────────────────────────────────────

  describe('getAll', () => {
    const query = {
      toQueryParams: () => ({ page: 1, pageSize: 10 }),
    } as unknown as TaxQueryParamsDto;

    it('returns paginated taxes', async () => {
      const items = [
        { id: 'tax-1', name: 'VAT', rate: 10, isActive: true },
        { id: 'tax-2', name: 'Service Tax', rate: 5, isActive: true },
      ];
      mockGetTaxesService.getAll.mockResolvedValue({ items, total: 2 });

      const result = await controller.getAll(query);

      expect(mockGetTaxesService.getAll).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
      });
      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      mockGetTaxesService.getAll.mockRejectedValue(new Error('DB error'));

      await expect(controller.getAll(query)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ────────────────────────────────────────────────────────────────
  // GET /taxes/active
  // ────────────────────────────────────────────────────────────────

  describe('getAllActive', () => {
    it('returns only active taxes', async () => {
      const taxes = [
        { id: 'tax-1', name: 'VAT', rate: 10, isActive: true },
        { id: 'tax-2', name: 'Service Tax', rate: 5, isActive: true },
      ];
      mockGetTaxesService.getAllActive.mockResolvedValue(taxes);

      const result = await controller.getAllActive();

      expect(mockGetTaxesService.getAllActive).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      mockGetTaxesService.getAllActive.mockRejectedValue(new Error('DB error'));

      await expect(controller.getAllActive()).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ────────────────────────────────────────────────────────────────
  // GET /taxes/:id
  // ────────────────────────────────────────────────────────────────

  describe('getById', () => {
    const taxId = 'tax-uuid';

    it('returns tax details', async () => {
      const tax = { id: taxId, name: 'VAT', rate: 10, isActive: true };
      mockGetTaxesService.getById.mockResolvedValue(tax);

      const result = await controller.getById(taxId);

      expect(mockGetTaxesService.getById).toHaveBeenCalledWith(taxId);
      expect(result).toBeDefined();
    });

    it('throws NotFoundException when tax not found', async () => {
      mockGetTaxesService.getById.mockRejectedValue(
        new TaxNotFoundException({ id: taxId }),
      );

      await expect(controller.getById(taxId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      mockGetTaxesService.getById.mockRejectedValue(new Error('DB error'));

      await expect(controller.getById(taxId)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ────────────────────────────────────────────────────────────────
  // POST /taxes
  // ────────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = {
      name: 'VAT',
      rate: 10,
      isActive: true,
    } as unknown as TaxCreateRequestDto;

    it('creates and returns a tax preview', async () => {
      const createdTax = { id: 'new-tax-id', ...dto };
      mockCreateTaxService.create.mockResolvedValue(createdTax);

      const result = await controller.create(dto);

      expect(mockCreateTaxService.create).toHaveBeenCalledWith(dto);
      expect(result).toBeDefined();
    });

    it('throws BadRequestException on DuplicateEntryException', async () => {
      mockCreateTaxService.create.mockRejectedValue(
        new DuplicateEntryException('Tax with this name already exists'),
      );

      await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      mockCreateTaxService.create.mockRejectedValue(new Error('DB error'));

      await expect(controller.create(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ────────────────────────────────────────────────────────────────
  // PUT /taxes/:id
  // ────────────────────────────────────────────────────────────────

  describe('update', () => {
    const taxId = 'tax-uuid';
    const dto = {
      name: 'Updated VAT',
      rate: 12,
    } as TaxUpdateRequestDto;

    it('updates and returns a tax preview', async () => {
      const updatedTax = { id: taxId, ...dto };
      mockUpdateTaxService.update.mockResolvedValue(updatedTax);

      const result = await controller.update(taxId, dto);

      expect(mockUpdateTaxService.update).toHaveBeenCalledWith(taxId, dto);
      expect(result).toBeDefined();
    });

    it('throws NotFoundException when tax not found', async () => {
      mockDeleteTaxService.delete.mockRejectedValue(
        new TaxNotFoundException({ id: taxId }),
      );

      await expect(controller.delete(taxId)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException on DuplicateEntryException', async () => {
      mockUpdateTaxService.update.mockRejectedValue(
        new DuplicateEntryException('Tax with this name already exists'),
      );

      await expect(controller.update(taxId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      mockUpdateTaxService.update.mockRejectedValue(new Error('DB error'));

      await expect(controller.update(taxId, dto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ────────────────────────────────────────────────────────────────
  // DELETE /taxes/:id
  // ────────────────────────────────────────────────────────────────

  describe('delete', () => {
    const taxId = 'tax-uuid';

    it('deletes a tax and returns a success message', async () => {
      mockDeleteTaxService.delete.mockResolvedValue(undefined);

      const result = await controller.delete(taxId);

      expect(mockDeleteTaxService.delete).toHaveBeenCalledWith(taxId);
      expect(result.message).toBe('Tax deleted successfully.');
    });

    it('throws NotFoundException when tax not found', async () => {
      mockDeleteTaxService.delete.mockRejectedValue(
        new TaxNotFoundException({
          id: taxId,
        }),
      );

      await expect(controller.delete(taxId)).rejects.toThrow(NotFoundException);
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      mockDeleteTaxService.delete.mockRejectedValue(new Error('DB error'));

      await expect(controller.delete(taxId)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ────────────────────────────────────────────────────────────────
  // POST /taxes/:id/entities
  // ────────────────────────────────────────────────────────────────

  describe('upsertEntityTaxAssociations', () => {
    const taxId = 'tax-uuid';
    const dto = {
      items: [
        {
          entityRef: { id: 'entity-1', type: EntityType.PRODUCT },
          isActive: true,
          note: 'Test note',
        },
        {
          entityRef: { id: 'entity-2', type: EntityType.CATEGORY },
          isActive: true,
        },
      ],
    } as TaxAssociationBulkUpsertRequestDto;

    it('upserts associations and returns formatted bulk response with all successes', async () => {
      const bulkResults = [
        {
          entityRef: { id: 'entity-1', type: EntityType.PRODUCT },
          status: 'SUCCEED' as const,
          config: {
            id: 'config-1',
            taxId,
            entityId: 'entity-1',
            entityType: EntityType.PRODUCT,
            isActive: true,
          },
          error: null,
        },
        {
          entityRef: { id: 'entity-2', type: EntityType.CATEGORY },
          status: 'SUCCEED' as const,
          config: {
            id: 'config-2',
            taxId,
            entityId: 'entity-2',
            entityType: EntityType.CATEGORY,
            isActive: true,
          },
          error: null,
        },
      ];

      mockAssociateEntityTaxService.bulkUpsert.mockResolvedValue(bulkResults);

      const result = await controller.upsertEntityTaxAssociations(taxId, dto);

      expect(mockAssociateEntityTaxService.bulkUpsert).toHaveBeenCalled();
      expect(result.total).toBe(2);
      expect(result.succeeded).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].status).toBe('SUCCEED');
      expect(result.items[1].status).toBe('SUCCEED');
    });

    it('returns partial failure in formatted response when some associations fail', async () => {
      const bulkResults = [
        {
          entityRef: { id: 'entity-1', type: EntityType.PRODUCT },
          status: 'SUCCEED' as const,
          config: {
            id: 'config-1',
            taxId,
            entityId: 'entity-1',
            entityType: EntityType.PRODUCT,
            isActive: true,
          },
          error: null,
        },
        {
          entityRef: { id: 'entity-2', type: EntityType.CATEGORY },
          status: 'FAILED' as const,
          config: null,
          error: { message: 'Entity not found', code: 'ENTITY_NOT_FOUND' },
        },
      ];

      mockAssociateEntityTaxService.bulkUpsert.mockResolvedValue(bulkResults);

      const result = await controller.upsertEntityTaxAssociations(taxId, dto);

      expect(result.total).toBe(2);
      expect(result.succeeded).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.items[0].status).toBe('SUCCEED');
      expect(result.items[1].status).toBe('FAILED');
      expect(result.items[1].error).toBeDefined();
    });

    it('throws NotFoundException when tax not found', async () => {
      mockAssociateEntityTaxService.bulkUpsert.mockRejectedValue(
        new TaxNotFoundException({ id: taxId }),
      );

      await expect(
        controller.upsertEntityTaxAssociations(taxId, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      mockAssociateEntityTaxService.bulkUpsert.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(
        controller.upsertEntityTaxAssociations(taxId, dto),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ────────────────────────────────────────────────────────────────
  // GET /taxes/:id/entities
  // ────────────────────────────────────────────────────────────────

  describe('getEntitiesForTax', () => {
    const taxId = 'tax-uuid';

    it('returns list of entity associations', async () => {
      const associations = [
        {
          id: 'assoc-1',
          taxId,
          entityId: 'entity-1',
          entityType: EntityType.PRODUCT,
          isActive: true,
        },
        {
          id: 'assoc-2',
          taxId,
          entityId: 'entity-2',
          entityType: EntityType.CATEGORY,
          isActive: true,
        },
      ];

      mockGetEntityTaxAssociationsService.getByTaxId.mockResolvedValue(
        associations,
      );

      const result = await controller.getEntitiesForTax(taxId);

      expect(
        mockGetEntityTaxAssociationsService.getByTaxId,
      ).toHaveBeenCalledWith(taxId);
      expect(result).toHaveLength(2);
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      mockGetEntityTaxAssociationsService.getByTaxId.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(controller.getEntitiesForTax(taxId)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ────────────────────────────────────────────────────────────────
  // GET /taxes/entity/:entityType/:entityId
  // ────────────────────────────────────────────────────────────────

  describe('getTaxesForEntity', () => {
    const entityId = 'entity-uuid';
    const entityType = EntityType.PRODUCT;

    it('returns list of tax associations for entity', async () => {
      const associations = [
        {
          id: 'assoc-1',
          taxId: 'tax-1',
          entityId,
          entityType,
          isActive: true,
        },
        {
          id: 'assoc-2',
          taxId: 'tax-2',
          entityId,
          entityType,
          isActive: true,
        },
      ];

      mockGetEntityTaxAssociationsService.getByEntity.mockResolvedValue(
        associations,
      );

      const result = await controller.getTaxesForEntity(entityId, entityType);

      expect(
        mockGetEntityTaxAssociationsService.getByEntity,
      ).toHaveBeenCalledWith(entityType, entityId);
      expect(result).toHaveLength(2);
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      mockGetEntityTaxAssociationsService.getByEntity.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(
        controller.getTaxesForEntity(entityId, entityType),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ────────────────────────────────────────────────────────────────
  // POST /taxes/:id/entities/remove
  // ────────────────────────────────────────────────────────────────
  describe('removeEntityTaxAssociations', () => {
    const taxId = 'tax-uuid';
    const dto = {
      associationIds: ['assoc-1', 'assoc-2', 'assoc-3'],
    };

    it('removes associations and returns formatted bulk response with all successes', async () => {
      const bulkResults = [
        { id: 'assoc-1', status: 'SUCCEED', error: null },
        { id: 'assoc-2', status: 'SUCCEED', error: null },
        { id: 'assoc-3', status: 'SUCCEED', error: null },
      ];
      mockRemoveEntityTaxAssociationService.bulkRemove.mockResolvedValue(
        bulkResults,
      );

      const result = await controller.removeEntityTaxAssociations(taxId, dto);

      expect(
        mockRemoveEntityTaxAssociationService.bulkRemove,
      ).toHaveBeenCalled();
      expect(result.total).toBe(3);
      expect(result.succeeded).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.items).toHaveLength(3);
      expect(result.items.every((i) => i.status === 'SUCCEED')).toBe(true);
    });

    it('returns partial failure in formatted response when some removals fail', async () => {
      const bulkResults = [
        { id: 'assoc-1', status: 'SUCCEED', error: null },
        { id: 'assoc-2', status: 'FAILED', error: 'Not found' },
        { id: 'assoc-3', status: 'SUCCEED', error: null },
      ];
      mockRemoveEntityTaxAssociationService.bulkRemove.mockResolvedValue(
        bulkResults,
      );

      const result = await controller.removeEntityTaxAssociations(taxId, dto);

      expect(result.total).toBe(3);
      expect(result.succeeded).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.items[1].status).toBe('FAILED');
      expect(result.items[1].error).toBe('Not found');
    });

    it('returns all failures in formatted response when all removals fail', async () => {
      const bulkResults = [
        { id: 'assoc-1', status: 'FAILED', error: 'Not found' },
        { id: 'assoc-2', status: 'FAILED', error: 'Not found' },
        { id: 'assoc-3', status: 'FAILED', error: 'Not found' },
      ];
      mockRemoveEntityTaxAssociationService.bulkRemove.mockResolvedValue(
        bulkResults,
      );

      const result = await controller.removeEntityTaxAssociations(taxId, dto);

      expect(result.total).toBe(3);
      expect(result.succeeded).toBe(0);
      expect(result.failed).toBe(3);
      expect(result.items.every((i) => i.status === 'FAILED')).toBe(true);
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      mockRemoveEntityTaxAssociationService.bulkRemove.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(
        controller.removeEntityTaxAssociations(taxId, dto),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ────────────────────────────────────────────────────────────────
  // Roles metadata
  // ────────────────────────────────────────────────────────────────

  describe('roles metadata', () => {
    // robust metadata lookup: try prototype, constructor, then function object
    const getRoles = (methodName: string) => {
      const key = 'role';
      // 1) metadata attached to prototype method
      const proto = Reflect.getMetadata(
        key,
        TaxController.prototype,
        methodName,
      );
      if (proto !== undefined) return proto;
      // 2) metadata attached to constructor (some emit targets)
      const cons = Reflect.getMetadata(key, TaxController, methodName);
      if (cons !== undefined) return cons;
      // 3) metadata attached directly to the function object
      const fn = (TaxController.prototype as any)[methodName];
      if (fn) {
        const fnMeta = Reflect.getMetadata(key, fn);
        if (fnMeta !== undefined) return fnMeta;
      }
      // 4) fallback to undefined
      return undefined;
    };

    it('getAll is restricted to ADMIN only', () => {
      const roles = getRoles('getAll');
      expect(roles).toEqual([Role.ADMIN]);
    });

    it('getAllActive has no Roles restriction', () => {
      const roles = getRoles('getAllActive');
      expect(roles).toBeUndefined();
    });

    it('getById is restricted to ADMIN only', () => {
      const roles = getRoles('getById');
      expect(roles).toEqual([Role.ADMIN]);
    });

    it('create is restricted to ADMIN only', () => {
      const roles = getRoles('create');
      expect(roles).toEqual([Role.ADMIN]);
    });

    it('update is restricted to ADMIN only', () => {
      const roles = getRoles('update');
      expect(roles).toEqual([Role.ADMIN]);
    });

    it('delete is restricted to ADMIN only', () => {
      const roles = getRoles('delete');
      expect(roles).toEqual([Role.ADMIN]);
    });

    it('upsertEntityTaxAssociations is restricted to ADMIN only', () => {
      const roles = getRoles('upsertEntityTaxAssociations');
      expect(roles).toEqual([Role.ADMIN]);
    });

    it('getEntitiesForTax is restricted to ADMIN only', () => {
      const roles = getRoles('getEntitiesForTax');
      expect(roles).toEqual([Role.ADMIN]);
    });

    it('getTaxesForEntity is restricted to ADMIN only', () => {
      const roles = getRoles('getTaxesForEntity');
      expect(roles).toEqual([Role.ADMIN]);
    });
  });
});
