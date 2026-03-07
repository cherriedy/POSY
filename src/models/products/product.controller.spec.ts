/* eslint-disable */
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

import { ProductController } from './product.controller';
import { GetProductsService } from './get-products';
import { CreateProductService } from './create-product';
import { UpdateProductService } from './update-product';
import { DeleteProductService } from './delete-product';
import { GetAttributesService } from './get-attributes';
import {
  UpsertAttributesMapper,
  UpsertAttributesService,
} from './upsert-attributes';
import { GetProductIngredientsService } from './get-product-ingredients';
import { UpsertIngredientsService } from './upsert-ingredients';
import { UpsertProductIngredientsMapper } from './upsert-ingredients';
import { RemoveProductIngredientService } from './remove-product-ingredient';
import { CreateProductMapper } from './create-product';

import {
  ProductNotFoundException,
  ProductIngredientNotFoundException,
} from './exceptions';
import {
  DuplicateEntryException,
  ForeignKeyViolationException,
} from '../../common/exceptions';

import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryParamsDto,
  ProductAttributeUpsertRequestDto,
  ProductIngredientBulkUpsertRequestDto,
} from './dto';
import { Role } from '../../common/enums';
import { Request } from 'express';

// ─── Helpers ────────────────────────────────────────────────────────────────

const mockLogger = { error: jest.fn(), log: jest.fn(), warn: jest.fn() };

const mockRequest = (role: string): Partial<Request> => ({
  user: { role, sub: 'user-id' },
});

// ─── Guard mock ──────────────────────────────────────────────────────────────

const passThroughGuard: CanActivate = {
  canActivate: (_ctx: ExecutionContext) => true,
};

// ─── Service mocks ───────────────────────────────────────────────────────────

const mockGetProductsService = {
  getAll: jest.fn(),
  getById: jest.fn(),
};
const mockCreateProductService = { create: jest.fn() };
const mockUpdateProductService = { update: jest.fn() };
const mockDeleteProductService = { delete: jest.fn() };
const mockGetAttributesService = { getByProductId: jest.fn() };
const mockUpsertAttributesService = { upsert: jest.fn() };
const mockGetProductIngredientsService = { getByProductId: jest.fn() };
const mockUpsertProductIngredientsService = { upsert: jest.fn() };
const mockRemoveProductIngredientService = {
  remove: jest.fn(),
  bulkRemove: jest.fn(),
};

// ─── Test suite ──────────────────────────────────────────────────────────────

describe('ProductController', () => {
  let controller: ProductController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        { provide: WINSTON_MODULE_NEST_PROVIDER, useValue: mockLogger },
        { provide: GetProductsService, useValue: mockGetProductsService },
        { provide: CreateProductService, useValue: mockCreateProductService },
        { provide: UpdateProductService, useValue: mockUpdateProductService },
        { provide: DeleteProductService, useValue: mockDeleteProductService },
        { provide: GetAttributesService, useValue: mockGetAttributesService },
        {
          provide: UpsertAttributesService,
          useValue: mockUpsertAttributesService,
        },
        {
          provide: GetProductIngredientsService,
          useValue: mockGetProductIngredientsService,
        },
        {
          provide: UpsertIngredientsService,
          useValue: mockUpsertProductIngredientsService,
        },
        {
          provide: RemoveProductIngredientService,
          useValue: mockRemoveProductIngredientService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(passThroughGuard)
      .overrideGuard(RoleGuard)
      .useValue(passThroughGuard)
      .compile();

    controller = module.get<ProductController>(ProductController);
  });

  // ── getAll ──────────────────────────────────────────────────────────────────

  describe('getAll', () => {
    const query = {
      toQueryParams: () => ({ page: 1, pageSize: 10 }),
    } as unknown as ProductQueryParamsDto;

    it('returns paginated products for admin (includes deleted)', async () => {
      const items = [{ id: '1', name: 'Product A' }];
      mockGetProductsService.getAll.mockResolvedValue({ items, total: 1 });

      const result = await controller.getAll(
        query,
        mockRequest(Role.ADMIN) as Request,
      );

      expect(mockGetProductsService.getAll).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
      });
      expect(result.total).toBe(1);
    });

    it('forces isDeleted=false for non-admin users', async () => {
      mockGetProductsService.getAll.mockResolvedValue({ items: [], total: 0 });

      await controller.getAll(query, mockRequest(Role.MANAGER) as Request);

      expect(mockGetProductsService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ filter: { isDeleted: false } }),
      );
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      mockGetProductsService.getAll.mockRejectedValue(new Error('DB error'));

      await expect(
        controller.getAll(query, mockRequest(Role.ADMIN) as Request),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── getAvailableProducts ────────────────────────────────────────────────────

  describe('getAvailableProducts', () => {
    it('returns only available, non-deleted products', async () => {
      const items = [{ id: '1', isAvailable: true, isDeleted: false }];
      mockGetProductsService.getAll.mockResolvedValue({ items, total: 1 });

      const result = await controller.getAvailableProducts();

      expect(mockGetProductsService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { isAvailable: true, isDeleted: false },
        }),
      );
      expect(result).toBeInstanceOf(Array);
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      mockGetProductsService.getAll.mockRejectedValue(new Error('fail'));

      await expect(controller.getAvailableProducts()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ── getById ─────────────────────────────────────────────────────────────────

  describe('getById', () => {
    const productId = 'product-uuid';

    it('returns product details for authenticated user', async () => {
      const product = { id: productId, isDeleted: false };
      mockGetProductsService.getById.mockResolvedValue(product);

      const result = await controller.getById(
        productId,
        mockRequest(Role.MANAGER) as Request,
      );

      expect(mockGetProductsService.getById).toHaveBeenCalledWith(productId);
      expect(result).toBeDefined();
    });

    it('throws NotFoundException when non-admin accesses a deleted product', async () => {
      mockGetProductsService.getById.mockResolvedValue({
        id: productId,
        isDeleted: true,
      });

      await expect(
        controller.getById(productId, mockRequest(Role.MANAGER) as Request),
      ).rejects.toThrow(NotFoundException);
    });

    it('allows admin to access deleted product', async () => {
      const product = { id: productId, isDeleted: true };
      mockGetProductsService.getById.mockResolvedValue(product);

      const result = await controller.getById(
        productId,
        mockRequest(Role.ADMIN) as Request,
      );

      expect(result).toBeDefined();
    });

    it('throws NotFoundException when product not found', async () => {
      mockGetProductsService.getById.mockRejectedValue(
        new ProductNotFoundException(productId),
      );

      await expect(
        controller.getById(productId, mockRequest(Role.ADMIN) as Request),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      mockGetProductsService.getById.mockRejectedValue(new Error('unexpected'));

      await expect(
        controller.getById(productId, mockRequest(Role.ADMIN) as Request),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = { name: 'New Product', price: 10 } as CreateProductDto;

    it('creates and returns a product preview', async () => {
      const product = { id: '1', name: 'New Product' };
      jest.spyOn(CreateProductMapper, 'toPayload').mockReturnValue({} as any);
      mockCreateProductService.create.mockResolvedValue(product);

      const result = await controller.create(dto);

      expect(mockCreateProductService.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('throws BadRequestException on DuplicateEntryException', async () => {
      jest.spyOn(CreateProductMapper, 'toPayload').mockReturnValue({} as any);
      mockCreateProductService.create.mockRejectedValue(
        new DuplicateEntryException('duplicate'),
      );

      await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException on ForeignKeyViolationException', async () => {
      jest.spyOn(CreateProductMapper, 'toPayload').mockReturnValue({} as any);
      mockCreateProductService.create.mockRejectedValue(
        new ForeignKeyViolationException({}),
      );

      await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      jest.spyOn(CreateProductMapper, 'toPayload').mockReturnValue({} as any);
      mockCreateProductService.create.mockRejectedValue(
        new Error('unexpected'),
      );

      await expect(controller.create(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    const productId = 'product-uuid';
    const dto = { name: 'Updated' } as UpdateProductDto;

    it('updates and returns a product preview', async () => {
      const product = { id: productId, name: 'Updated' };
      mockUpdateProductService.update.mockResolvedValue(product);

      const result = await controller.update(productId, dto);

      expect(mockUpdateProductService.update).toHaveBeenCalledWith(
        productId,
        dto,
      );
      expect(result).toBeDefined();
    });

    it('throws NotFoundException when product not found', async () => {
      mockUpdateProductService.update.mockRejectedValue(
        new ProductNotFoundException(productId),
      );

      await expect(controller.update(productId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException on DuplicateEntryException', async () => {
      mockUpdateProductService.update.mockRejectedValue(
        new DuplicateEntryException('duplicate'),
      );

      await expect(controller.update(productId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      mockUpdateProductService.update.mockRejectedValue(
        new Error('unexpected'),
      );

      await expect(controller.update(productId, dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ── delete ──────────────────────────────────────────────────────────────────

  describe('delete', () => {
    const productId = 'product-uuid';

    it('deletes a product and returns a success message', async () => {
      mockDeleteProductService.delete.mockResolvedValue(undefined);

      const result = await controller.delete(productId);

      expect(mockDeleteProductService.delete).toHaveBeenCalledWith(productId);
      expect(result).toEqual({ message: 'Product deleted successfully.' });
    });

    it('throws NotFoundException when product not found', async () => {
      mockDeleteProductService.delete.mockRejectedValue(
        new ProductNotFoundException(productId),
      );

      await expect(controller.delete(productId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      mockDeleteProductService.delete.mockRejectedValue(
        new Error('unexpected'),
      );

      await expect(controller.delete(productId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ── getProductAttributes ────────────────────────────────────────────────────

  describe('getProductAttributes', () => {
    const productId = 'product-uuid';

    it('returns product attributes', async () => {
      const attributes = { id: 'attr-1', productId };
      mockGetAttributesService.getByProductId.mockResolvedValue(attributes);

      const result = await controller.getProductAttributes(productId);

      expect(mockGetAttributesService.getByProductId).toHaveBeenCalledWith(
        productId,
      );
      expect(result).toBeDefined();
    });

    it('returns null when no attributes found', async () => {
      mockGetAttributesService.getByProductId.mockResolvedValue(null);

      const result = await controller.getProductAttributes(productId);

      expect(result).toBeNull();
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      mockGetAttributesService.getByProductId.mockRejectedValue(
        new Error('unexpected'),
      );

      await expect(controller.getProductAttributes(productId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ── upsertProductAttributes ─────────────────────────────────────────────────

  describe('upsertProductAttributes', () => {
    const productId = 'product-uuid';
    const dto = {} as ProductAttributeUpsertRequestDto;

    it('upserts and returns product attributes', async () => {
      const attributes = { id: 'attr-1', productId };
      mockUpsertAttributesService.upsert.mockResolvedValue(attributes);

      const result = await controller.upsertProductAttributes(productId, dto);

      expect(mockUpsertAttributesService.upsert).toHaveBeenCalledWith(
        UpsertAttributesMapper.toPayload(productId, dto),
      );
      expect(result).toBeDefined();
    });

    it('throws BadRequestException on DuplicateEntryException', async () => {
      mockUpsertAttributesService.upsert.mockRejectedValue(
        new DuplicateEntryException('duplicate'),
      );

      await expect(
        controller.upsertProductAttributes(productId, dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException on ForeignKeyViolationException', async () => {
      mockUpsertAttributesService.upsert.mockRejectedValue(
        new ForeignKeyViolationException({}),
      );

      await expect(
        controller.upsertProductAttributes(productId, dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      mockUpsertAttributesService.upsert.mockRejectedValue(
        new Error('unexpected'),
      );

      await expect(
        controller.upsertProductAttributes(productId, dto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── getProductIngredients ───────────────────────────────────────────────────

  describe('getProductIngredients', () => {
    const productId = 'product-uuid';

    it('returns list of product ingredients', async () => {
      const ingredients = [{ id: 'ing-1', quantity: 2 }];
      mockGetProductIngredientsService.getByProductId.mockResolvedValue(
        ingredients,
      );

      const result = await controller.getProductIngredients(productId);

      expect(
        mockGetProductIngredientsService.getByProductId,
      ).toHaveBeenCalledWith(productId);
      expect(result).toBeInstanceOf(Array);
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      mockGetProductIngredientsService.getByProductId.mockRejectedValue(
        new Error('unexpected'),
      );

      await expect(controller.getProductIngredients(productId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ── upsertProductIngredients ────────────────────────────────────────────────

  describe('upsertProductIngredients', () => {
    const productId = 'product-uuid';
    const dto: ProductIngredientBulkUpsertRequestDto = {
      ingredients: [{ ingredientId: 'ing-uuid', quantity: 1.5 }],
    };

    it('upserts and returns product ingredients', async () => {
      const upserted = [{ id: 'pi-1', quantity: 1.5 }];
      jest
        .spyOn(UpsertProductIngredientsMapper, 'toPayload')
        .mockReturnValue({ productId, ingredients: dto.ingredients } as any);
      mockUpsertProductIngredientsService.upsert.mockResolvedValue(upserted);

      const result = await controller.upsertProductIngredients(productId, dto);

      expect(UpsertProductIngredientsMapper.toPayload).toHaveBeenCalledWith(
        productId,
        dto,
      );
      expect(mockUpsertProductIngredientsService.upsert).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Array);
    });

    it('throws BadRequestException on DuplicateEntryException', async () => {
      jest
        .spyOn(UpsertProductIngredientsMapper, 'toPayload')
        .mockReturnValue({} as any);
      mockUpsertProductIngredientsService.upsert.mockRejectedValue(
        new DuplicateEntryException('duplicate'),
      );

      await expect(
        controller.upsertProductIngredients(productId, dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException on ForeignKeyViolationException', async () => {
      jest
        .spyOn(UpsertProductIngredientsMapper, 'toPayload')
        .mockReturnValue({} as any);
      mockUpsertProductIngredientsService.upsert.mockRejectedValue(
        new ForeignKeyViolationException({}),
      );

      await expect(
        controller.upsertProductIngredients(productId, dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      jest
        .spyOn(UpsertProductIngredientsMapper, 'toPayload')
        .mockReturnValue({} as any);
      mockUpsertProductIngredientsService.upsert.mockRejectedValue(
        new Error('unexpected'),
      );

      await expect(
        controller.upsertProductIngredients(productId, dto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── removeProductIngredients ────────────────────────────────────────────────

  describe('removeProductIngredients', () => {
    const productId = 'product-uuid';
    const dto = {
      ingredientIds: ['ingredient-uuid-1', 'ingredient-uuid-2'],
    };

    it('removes ingredients and returns success message', async () => {
      mockRemoveProductIngredientService.bulkRemove.mockResolvedValue(
        undefined,
      );

      const result = await controller.removeProductIngredients(productId, dto);

      expect(
        mockRemoveProductIngredientService.bulkRemove,
      ).toHaveBeenCalledWith({
        productId,
        ingredientIds: dto.ingredientIds,
      });
      expect(result).toEqual({
        message: 'Product ingredients removed successfully.',
      });
    });

    it('throws NotFoundException when ingredients not found on product', async () => {
      mockRemoveProductIngredientService.bulkRemove.mockRejectedValue(
        new ProductIngredientNotFoundException(
          `No ingredients found for product ${productId} with the provided ingredient IDs`,
        ),
      );

      await expect(
        controller.removeProductIngredients(productId, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      mockRemoveProductIngredientService.bulkRemove.mockRejectedValue(
        new Error('unexpected'),
      );

      await expect(
        controller.removeProductIngredients(productId, dto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
