import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@posy/auth';
import { UnitController } from './unit.controller';
import { CreateUnitService } from '@posy/units/features/create-unit/create-unit.service';
import { GetUnitsService } from '@posy/units/features/get-units/get-units.service';
import { UpdateUnitService } from '@posy/units/features/update-unit/update-unit.service';
import { DeleteUnitService } from '@posy/units/features/delete-unit/delete-unit.service';
import { DuplicateEntryError } from '@posy/shared';
import { UnitNotFoundException } from '@posy/units/shared/errors/unit-not-found.exception';
import { UnitCreateRequestDto } from './dto/unit-create-request.dto';

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

    it('should throw Error on unexpected error', async () => {
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
      await expect(controller.getAll(queryDto)).rejects.toThrow(Error);
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

    it('should throw UnitNotFoundException when unit not found', async () => {
      mockGetUnitsService.getById.mockRejectedValue(
        new UnitNotFoundException(unitId),
      );

      await expect(controller.getById(unitId)).rejects.toThrow(
        UnitNotFoundException,
      );
    });

    it('should throw Error on unexpected error', async () => {
      mockGetUnitsService.getById.mockRejectedValue(new Error('unexpected'));

      await expect(controller.getById(unitId)).rejects.toThrow(Error);
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

    it('should throw DuplicateEntryError on DuplicateEntryError', async () => {
      mockCreateUnitService.create.mockRejectedValue(
        new DuplicateEntryError('Unit name or abbreviation already exists'),
      );

      await expect(controller.create(dto)).rejects.toThrow(DuplicateEntryError);
    });

    it('should throw Error on unexpected error', async () => {
      mockCreateUnitService.create.mockRejectedValue(new Error('unexpected'));

      await expect(controller.create(dto)).rejects.toThrow(Error);
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

    it('should throw UnitNotFoundException when unit not found', async () => {
      mockUpdateUnitService.update.mockRejectedValue(
        new UnitNotFoundException(unitId),
      );

      await expect(controller.update(unitId, dto)).rejects.toThrow(
        UnitNotFoundException,
      );
    });

    it('should throw DuplicateEntryError on DuplicateEntryError', async () => {
      mockUpdateUnitService.update.mockRejectedValue(
        new DuplicateEntryError('duplicate'),
      );

      await expect(controller.update(unitId, dto)).rejects.toThrow(
        DuplicateEntryError,
      );
    });

    it('should throw Error on unexpected error', async () => {
      mockUpdateUnitService.update.mockRejectedValue(new Error('unexpected'));

      await expect(controller.update(unitId, dto)).rejects.toThrow(Error);
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

    it('should throw UnitNotFoundException when unit not found', async () => {
      mockDeleteUnitService.delete.mockRejectedValue(
        new UnitNotFoundException(unitId),
      );

      await expect(controller.delete(unitId)).rejects.toThrow(
        UnitNotFoundException,
      );
    });

    it('should throw Error on unexpected error', async () => {
      mockDeleteUnitService.delete.mockRejectedValue(new Error('unexpected'));

      await expect(controller.delete(unitId)).rejects.toThrow(Error);
    });
  });
});
