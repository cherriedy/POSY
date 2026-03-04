import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { VendorController } from './vendor.controller';
import { CreateVendorService } from './create-vendor';
import { GetVendorsService } from './get-vendors';
import { UpdateVendorService } from './update-vendor';
import { DeleteVendorService } from './delete-vendor';
import { DuplicateEntryException } from '../../common/exceptions';
import { VendorNotFoundException } from './exceptions';
import { VendorCreateRequestDto, VendorQueryParamsDto } from './dto';
import { VendorStatus } from './enums';

// ─── Helpers ────────────────────────────────────────────────────────────────

const mockLogger = { error: jest.fn(), log: jest.fn(), warn: jest.fn() };

// ─── Guard mock ──────────────────────────────────────────────────────────────

const passThroughGuard = {
  canActivate: () => true,
};

// ─── Service mocks ───────────────────────────────────────────────────────────

const mockCreateVendorService = { create: jest.fn() };
const mockGetVendorsService = { getAll: jest.fn(), getById: jest.fn() };
const mockUpdateVendorService = { update: jest.fn() };
const mockDeleteVendorService = { delete: jest.fn() };

// ─── Test suite ──────────────────────────────────────────────────────────────

describe('VendorController', () => {
  let controller: VendorController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorController],
      providers: [
        { provide: WINSTON_MODULE_NEST_PROVIDER, useValue: mockLogger },
        { provide: CreateVendorService, useValue: mockCreateVendorService },
        { provide: GetVendorsService, useValue: mockGetVendorsService },
        { provide: UpdateVendorService, useValue: mockUpdateVendorService },
        { provide: DeleteVendorService, useValue: mockDeleteVendorService },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(passThroughGuard)
      .overrideGuard(RoleGuard)
      .useValue(passThroughGuard)
      .compile();

    controller = module.get<VendorController>(VendorController);
  });

  // ── getAll ──────────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('should return all vendors', async () => {
      const vendors = [
        { id: '1', name: 'Fresh Farms', status: VendorStatus.ACTIVE },
        { id: '2', name: 'Quality Suppliers', status: VendorStatus.ACTIVE },
      ];
      const vendorPage = {
        items: vendors,
        page: 1,
        pageSize: 20,
        total: 2,
        totalPages: 1,
      };
      mockGetVendorsService.getAll.mockResolvedValue(vendorPage);

      const query = new VendorQueryParamsDto();
      const result = await controller.getAll(query);

      expect(mockGetVendorsService.getAll).toHaveBeenCalled();
      expect(result.items).toBeInstanceOf(Array);
      expect(result.items.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockGetVendorsService.getAll.mockRejectedValue(new Error('DB error'));

      const query = new VendorQueryParamsDto();
      await expect(controller.getAll(query)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ── getById ─────────────────────────────────────────────────────────────────

  describe('getById', () => {
    const vendorId = 'vendor-uuid';

    it('should return a vendor by id', async () => {
      const vendor = {
        id: vendorId,
        name: 'Fresh Farms',
        status: VendorStatus.ACTIVE,
      };
      mockGetVendorsService.getById.mockResolvedValue(vendor);

      const result = await controller.getById(vendorId);

      expect(mockGetVendorsService.getById).toHaveBeenCalledWith(vendorId);
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when vendor not found', async () => {
      mockGetVendorsService.getById.mockRejectedValue(
        new VendorNotFoundException(vendorId),
      );

      await expect(controller.getById(vendorId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockGetVendorsService.getById.mockRejectedValue(new Error('unexpected'));

      await expect(controller.getById(vendorId)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto: VendorCreateRequestDto = {
      name: 'Fresh Farms',
      contactName: null,
      email: null,
      phone: null,
      address: null,
      taxCode: null,
      paymentTerm: null,
      note: null,
      status: VendorStatus.ACTIVE,
    };

    it('should create and return a vendor', async () => {
      const vendor = {
        id: '1',
        name: 'Fresh Farms',
        status: VendorStatus.ACTIVE,
      };
      mockCreateVendorService.create.mockResolvedValue(vendor);

      const result = await controller.create(dto);

      expect(mockCreateVendorService.create).toHaveBeenCalledWith({
        name: dto.name,
        contactName: dto.contactName,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        taxCode: dto.taxCode,
        paymentTerm: dto.paymentTerm,
        note: dto.note,
        status: dto.status,
      });
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException on DuplicateEntryException', async () => {
      mockCreateVendorService.create.mockRejectedValue(
        new DuplicateEntryException('Vendor already exists'),
      );

      await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockCreateVendorService.create.mockRejectedValue(new Error('unexpected'));

      await expect(controller.create(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    const vendorId = 'vendor-uuid';
    const dto: VendorCreateRequestDto = {
      name: 'Fresh Farms Updated',
      contactName: null,
      email: null,
      phone: null,
      address: null,
      taxCode: null,
      paymentTerm: null,
      note: null,
      status: VendorStatus.ACTIVE,
    };

    it('should update and return a vendor', async () => {
      const vendor = {
        id: vendorId,
        name: 'Fresh Farms Updated',
        status: VendorStatus.ACTIVE,
      };
      mockUpdateVendorService.update.mockResolvedValue(vendor);

      const result = await controller.update(vendorId, dto);

      expect(mockUpdateVendorService.update).toHaveBeenCalledWith(vendorId, {
        name: dto.name,
        contactName: dto.contactName,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        taxCode: dto.taxCode,
        paymentTerm: dto.paymentTerm,
        note: dto.note,
        status: dto.status,
      });
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when vendor not found', async () => {
      mockUpdateVendorService.update.mockRejectedValue(
        new VendorNotFoundException(vendorId),
      );

      await expect(controller.update(vendorId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException on DuplicateEntryException', async () => {
      mockUpdateVendorService.update.mockRejectedValue(
        new DuplicateEntryException('duplicate'),
      );

      await expect(controller.update(vendorId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockUpdateVendorService.update.mockRejectedValue(new Error('unexpected'));

      await expect(controller.update(vendorId, dto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ── delete ──────────────────────────────────────────────────────────────────

  describe('delete', () => {
    const vendorId = 'vendor-uuid';

    it('should delete a vendor and return a success message', async () => {
      mockDeleteVendorService.delete.mockResolvedValue(undefined);

      const result = await controller.delete(vendorId);

      expect(mockDeleteVendorService.delete).toHaveBeenCalledWith(vendorId);
      expect(result).toEqual({ message: 'Vendor deleted successfully.' });
    });

    it('should throw BadRequestException when vendor not found', async () => {
      mockDeleteVendorService.delete.mockRejectedValue(
        new VendorNotFoundException(vendorId),
      );

      await expect(controller.delete(vendorId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockDeleteVendorService.delete.mockRejectedValue(new Error('unexpected'));

      await expect(controller.delete(vendorId)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
