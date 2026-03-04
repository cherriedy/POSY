import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { UnitController } from './unit.controller';
import { CreateUnitService } from './create-unit';
import { GetUnitsService } from './get-units';
import { UpdateUnitService } from './update-unit';
import { DeleteUnitService } from './delete-unit';
import { DuplicateEntryException } from '../../common/exceptions';
import { UnitNotFoundException } from './exceptions';
import { UnitCreateRequestDto } from './dto';

// ─── Helpers ────────────────────────────────────────────────────────────────

const mockLogger = { error: jest.fn(), log: jest.fn(), warn: jest.fn() };

// ─── Guard mock ──────────────────────────────────────────────────────────────

const passThroughGuard = {
  canActivate: () => true,
};

// ─── Service mocks ───────────────────────────────────────────────────────────

const mockCreateUnitService = { create: jest.fn() };
const mockGetUnitsService = { getAllPaged: jest.fn(), getById: jest.fn() };
const mockUpdateUnitService = { update: jest.fn() };
const mockDeleteUnitService = { delete: jest.fn() };

// ─── Test suite ──────────────────────────────────────────────────────────────

describe('UnitController', () => {
  let controller: UnitController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitController],
      providers: [
        { provide: WINSTON_MODULE_NEST_PROVIDER, useValue: mockLogger },
        { provide: CreateUnitService, useValue: mockCreateUnitService },
        { provide: GetUnitsService, useValue: mockGetUnitsService },
        { provide: UpdateUnitService, useValue: mockUpdateUnitService },
        { provide: DeleteUnitService, useValue: mockDeleteUnitService },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(passThroughGuard)
      .overrideGuard(RoleGuard)
      .useValue(passThroughGuard)
      .compile();

    controller = module.get<UnitController>(UnitController);
  });

  // ── getAll ──────────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('should return paged units', async () => {
      const pagedResult = {
        items: [
          { id: '1', name: 'Kilogram', abbreviation: 'kg' },
          { id: '2', name: 'Liter', abbreviation: 'L' },
        ],
        page: 1,
        pageSize: 2,
        total: 2,
        totalPages: 1,
      };
      mockGetUnitsService.getAllPaged.mockResolvedValue(pagedResult);
      const queryDto = {
        page: 1,
        pageSize: 2,
        toQueryParams: function (this: { page: number; pageSize: number }) {
          return {
            page: this.page,
            pageSize: this.pageSize,
            orderBy: undefined,
            filter: { query: undefined, isDeleted: undefined },
          };
        },
      };
      const result = await controller.getAll(queryDto);
      expect(mockGetUnitsService.getAllPaged).toHaveBeenCalledWith({
        page: 1,
        pageSize: 2,
        orderBy: undefined,
        filter: { query: undefined, isDeleted: undefined },
      });
      expect(result).toHaveProperty('items');
      expect(result.items.length).toBe(2);
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('pageSize', 2);
      expect(result).toHaveProperty('total', 2);
      expect(result).toHaveProperty('totalPages', 1);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockGetUnitsService.getAllPaged.mockRejectedValue(new Error('DB error'));
      const queryDto = {
        page: 1,
        pageSize: 2,
        toQueryParams: function (this: { page: number; pageSize: number }) {
          return {
            page: this.page,
            pageSize: this.pageSize,
            orderBy: undefined,
            filter: { query: undefined, isDeleted: undefined },
          };
        },
      };
      await expect(controller.getAll(queryDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ── getById ─────────────────────────────────────────────────────────────────

  describe('getById', () => {
    const unitId = 'unit-uuid';

    it('should return a unit by id', async () => {
      const unit = { id: unitId, name: 'Kilogram', abbreviation: 'kg' };
      mockGetUnitsService.getById.mockResolvedValue(unit);

      const result = await controller.getById(unitId);

      expect(mockGetUnitsService.getById).toHaveBeenCalledWith(unitId);
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when unit not found', async () => {
      mockGetUnitsService.getById.mockRejectedValue(
        new UnitNotFoundException(unitId),
      );

      await expect(controller.getById(unitId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockGetUnitsService.getById.mockRejectedValue(new Error('unexpected'));

      await expect(controller.getById(unitId)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto: UnitCreateRequestDto = { name: 'Kilogram', abbreviation: 'kg' };

    it('should create and return a unit', async () => {
      const unit = { id: '1', name: 'Kilogram', abbreviation: 'kg' };
      mockCreateUnitService.create.mockResolvedValue(unit);

      const result = await controller.create(dto);

      expect(mockCreateUnitService.create).toHaveBeenCalledWith({
        name: dto.name,
        abbreviation: dto.abbreviation,
      });
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException on DuplicateEntryException', async () => {
      mockCreateUnitService.create.mockRejectedValue(
        new DuplicateEntryException('Unit name or abbreviation already exists'),
      );

      await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockCreateUnitService.create.mockRejectedValue(new Error('unexpected'));

      await expect(controller.create(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    const unitId = 'unit-uuid';
    const dto: UnitCreateRequestDto = { name: 'Kilogram', abbreviation: 'kg' };

    it('should update and return a unit', async () => {
      const unit = { id: unitId, name: 'Kilogram', abbreviation: 'kg' };
      mockUpdateUnitService.update.mockResolvedValue(unit);

      const result = await controller.update(unitId, dto);

      expect(mockUpdateUnitService.update).toHaveBeenCalledWith(unitId, {
        name: dto.name,
        abbreviation: dto.abbreviation,
      });
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when unit not found', async () => {
      mockUpdateUnitService.update.mockRejectedValue(
        new UnitNotFoundException(unitId),
      );

      await expect(controller.update(unitId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException on DuplicateEntryException', async () => {
      mockUpdateUnitService.update.mockRejectedValue(
        new DuplicateEntryException('duplicate'),
      );

      await expect(controller.update(unitId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockUpdateUnitService.update.mockRejectedValue(new Error('unexpected'));

      await expect(controller.update(unitId, dto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ── delete ──────────────────────────────────────────────────────────────────

  describe('delete', () => {
    const unitId = 'unit-uuid';

    it('should delete a unit and return a success message', async () => {
      mockDeleteUnitService.delete.mockResolvedValue(undefined);

      const result = await controller.delete(unitId);

      expect(mockDeleteUnitService.delete).toHaveBeenCalledWith(unitId);
      expect(result).toEqual({ message: 'Unit deleted successfully.' });
    });

    it('should throw BadRequestException when unit not found', async () => {
      mockDeleteUnitService.delete.mockRejectedValue(
        new UnitNotFoundException(unitId),
      );

      await expect(controller.delete(unitId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockDeleteUnitService.delete.mockRejectedValue(new Error('unexpected'));

      await expect(controller.delete(unitId)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
