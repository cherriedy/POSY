/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { IngredientController } from './ingredient.controller';
import { CreateIngredientService } from './features/create-ingredient/create-ingredient.service';
import { UpdateIngredientService } from './features/update-ingredient/update-ingredient.service';
import { GetIngredientsService } from './features/get-ingredients/get-ingredients.service';
import { DeleteIngredientService } from './features/delete-ingredient/delete-ingredient.service';
import { IngredientNotFoundException } from './shared/exceptions/ingredient-not-found.exception';
import { Ingredient } from './shared/entities/ingredient';
import { IngredientCreateUpdateDto } from './shared/dto/ingredient-create-update.dto';
import { IngredientUpdateRequestDto } from './shared/dto/ingredient-update-request.dto';
import { IngredientQueryParamsDto } from './shared/dto/ingredient-query-params.dto';
import { DuplicateEntryError } from '../../common/errors/duplicate-entry.error';
import { ForeignKeyViolationError } from '../../common/errors/foreign-key-violation.error';
import { RoleGuard } from '../../authorization/guards/role.guard';

const mockIngredient = (): Ingredient =>
  new Ingredient(
    'ingredient-id-1',
    'vendor-id-1',
    'unit-id-1',
    'Tomato',
    100,
    20,
    5.99,
    null,
    new Date('2024-01-01'),
    new Date('2024-01-01'),
  );

const mockPage = () => ({
  items: [mockIngredient()],
  total: 1,
  page: 1,
  pageSize: 10,
});

const noOpGuard = { canActivate: () => true };

describe('IngredientController', () => {
  let controller: IngredientController;
  let createService: jest.Mocked<CreateIngredientService>;
  let updateService: jest.Mocked<UpdateIngredientService>;
  let getService: jest.Mocked<GetIngredientsService>;
  let deleteService: jest.Mocked<DeleteIngredientService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientController],
      providers: [
        { provide: CreateIngredientService, useValue: { create: jest.fn() } },
        { provide: UpdateIngredientService, useValue: { update: jest.fn() } },
        {
          provide: GetIngredientsService,
          useValue: { getAll: jest.fn(), getById: jest.fn() },
        },
        { provide: DeleteIngredientService, useValue: { delete: jest.fn() } },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(noOpGuard)
      .overrideGuard(RoleGuard)
      .useValue(noOpGuard)
      .compile();

    controller = module.get(IngredientController);
    createService = module.get(CreateIngredientService);
    updateService = module.get(UpdateIngredientService);
    getService = module.get(GetIngredientsService);
    deleteService = module.get(DeleteIngredientService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── getAll ───────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('should return a paginated list of ingredients', async () => {
      const page = mockPage();
      // @ts-ignore
      getService.getAll.mockResolvedValue(page);

      const query = Object.assign(new IngredientQueryParamsDto(), {
        page: 1,
        pageSize: 10,
      });
      const result = await controller.getAll(query);

      expect(getService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, pageSize: 10 }),
      );
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('should use defaults when page and pageSize are not provided', async () => {
      // @ts-ignore
      getService.getAll.mockResolvedValue(mockPage());

      const query = new IngredientQueryParamsDto();
      await controller.getAll(query);

      expect(getService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { vendorId: undefined, unitId: undefined, query: undefined },
        }),
      );
    });

    it('should pass filter params to the service', async () => {
      // @ts-ignore
      getService.getAll.mockResolvedValue(mockPage());

      const query = Object.assign(new IngredientQueryParamsDto(), {
        vendorId: 'vendor-id-1',
        unitId: 'unit-id-1',
        query: 'Tomato',
      });
      await controller.getAll(query);

      expect(getService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: {
            vendorId: 'vendor-id-1',
            unitId: 'unit-id-1',
            query: 'Tomato',
          },
        }),
      );
    });

    it('should parse and pass orderBy to the service', async () => {
      // @ts-ignore
      getService.getAll.mockResolvedValue(mockPage());

      const query = Object.assign(new IngredientQueryParamsDto(), {
        orderBy: 'name:asc,createdAt:desc',
      });
      await controller.getAll(query);

      expect(getService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [
            { field: 'name', direction: 'asc' },
            { field: 'createdAt', direction: 'desc' },
          ],
        }),
      );
    });

    it('should throw Error on unexpected error', async () => {
      getService.getAll.mockRejectedValue(new Error('DB error'));

      await expect(
        controller.getAll(new IngredientQueryParamsDto()),
      ).rejects.toThrow(Error);
    });
  });

  // ─── getById ─────────────────────────────────────────────────────────────

  describe('getById', () => {
    it('should return an ingredient by id', async () => {
      getService.getById.mockResolvedValue(mockIngredient());

      const result = await controller.getById('ingredient-id-1');

      expect(getService.getById).toHaveBeenCalledWith('ingredient-id-1');
      expect(result).toBeDefined();
    });

    it('should throw IngredientNotFoundException when ingredient is not found', async () => {
      getService.getById.mockRejectedValue(
        new IngredientNotFoundException('ingredient-id-1'),
      );

      await expect(controller.getById('ingredient-id-1')).rejects.toThrow(
        IngredientNotFoundException,
      );
    });

    it('should throw Error on unexpected error', async () => {
      getService.getById.mockRejectedValue(new Error('DB error'));

      await expect(controller.getById('ingredient-id-1')).rejects.toThrow(
        Error,
      );
    });
  });

  // ─── create ──────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto: IngredientCreateUpdateDto = {
      vendorId: 'vendor-id-1',
      unitId: 'unit-id-1',
      name: 'Tomato',
      stock: 100,
      minStock: 20,
      unitCost: 5.99,
      expiredAt: '2024-12-31',
    };

    it('should create and return an ingredient', async () => {
      createService.create.mockResolvedValue(mockIngredient());

      const result = await controller.create(dto);

      expect(createService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          vendorId: dto.vendorId,
          unitId: dto.unitId,
          name: dto.name,
          stock: dto.stock,
          minStock: dto.minStock,
          unitCost: dto.unitCost,
          expiredAt: new Date(dto.expiredAt!),
        }),
      );
      expect(result).toBeDefined();
    });

    it('should map expiredAt to null when not provided', async () => {
      const dtoWithoutExpiry: IngredientCreateUpdateDto = {
        ...dto,
        expiredAt: undefined,
      };
      createService.create.mockResolvedValue(mockIngredient());

      await controller.create(dtoWithoutExpiry);

      expect(createService.create).toHaveBeenCalledWith(
        expect.objectContaining({ expiredAt: null }),
      );
    });

    it('should throw DuplicateEntryError on DuplicateEntryError', async () => {
      createService.create.mockRejectedValue(
        new DuplicateEntryError('Ingredient already exists'),
      );

      await expect(controller.create(dto)).rejects.toThrow(DuplicateEntryError);
    });

    it('should throw ForeignKeyViolationError on ForeignKeyViolationError', async () => {
      createService.create.mockRejectedValue(
        new ForeignKeyViolationError({}),
      );

      await expect(controller.create(dto)).rejects.toThrow(ForeignKeyViolationError);
    });

    it('should throw Error on unexpected error', async () => {
      createService.create.mockRejectedValue(new Error('DB error'));

      await expect(controller.create(dto)).rejects.toThrow(Error);
    });
  });

  // ─── update ──────────────────────────────────────────────────────────────

  describe('update', () => {
    const dto: IngredientUpdateRequestDto = {
      name: 'Updated Tomato',
      stock: 80,
    };

    it('should update and return the ingredient', async () => {
      const updated = { ...mockIngredient(), name: 'Updated Tomato' };
      updateService.update.mockResolvedValue(updated);

      const result = await controller.update('ingredient-id-1', dto);

      expect(updateService.update).toHaveBeenCalledWith(
        'ingredient-id-1',
        expect.objectContaining({ name: 'Updated Tomato', stock: 80 }),
      );
      expect(result).toBeDefined();
    });

    it('should only include defined fields in the update payload', async () => {
      updateService.update.mockResolvedValue(mockIngredient());

      await controller.update('ingredient-id-1', { name: 'New Name' });

      const payload = updateService.update.mock.calls[0][1];
      expect(payload).toHaveProperty('name', 'New Name');
      expect(payload).not.toHaveProperty('stock');
      expect(payload).not.toHaveProperty('unitCost');
    });

    it('should map expiredAt to a Date when provided in dto', async () => {
      updateService.update.mockResolvedValue(mockIngredient());
      const dtoWithExpiry: IngredientUpdateRequestDto = {
        expiredAt: '2025-01-01',
      };

      await controller.update('ingredient-id-1', dtoWithExpiry);

      expect(updateService.update).toHaveBeenCalledWith(
        'ingredient-id-1',
        expect.objectContaining({ expiredAt: new Date('2025-01-01') }),
      );
    });

    it('should throw IngredientNotFoundException when ingredient not found', async () => {
      updateService.update.mockRejectedValue(
        new IngredientNotFoundException('ingredient-id-1'),
      );

      await expect(controller.update('ingredient-id-1', dto)).rejects.toThrow(
        IngredientNotFoundException,
      );
    });

    it('should throw DuplicateEntryError on DuplicateEntryError', async () => {
      updateService.update.mockRejectedValue(
        new DuplicateEntryError('Duplicate'),
      );

      await expect(controller.update('ingredient-id-1', dto)).rejects.toThrow(
        DuplicateEntryError,
      );
    });

    it('should throw ForeignKeyViolationError on ForeignKeyViolationError', async () => {
      updateService.update.mockRejectedValue(
        new ForeignKeyViolationError({}),
      );

      await expect(controller.update('ingredient-id-1', dto)).rejects.toThrow(
        ForeignKeyViolationError,
      );
    });

    it('should throw Error on unexpected error', async () => {
      updateService.update.mockRejectedValue(new Error('DB error'));

      await expect(controller.update('ingredient-id-1', dto)).rejects.toThrow(
        Error,
      );
    });
  });

  // ─── delete ──────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('should delete an ingredient and return a success message', async () => {
      deleteService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('ingredient-id-1');

      expect(deleteService.delete).toHaveBeenCalledWith('ingredient-id-1');
      expect(result).toEqual({ message: 'Ingredient deleted successfully' });
    });

    it('should throw IngredientNotFoundException when ingredient not found', async () => {
      deleteService.delete.mockRejectedValue(
        new IngredientNotFoundException('ingredient-id-1'),
      );

      await expect(controller.delete('ingredient-id-1')).rejects.toThrow(
        IngredientNotFoundException,
      );
    });

    it('should throw Error on unexpected error', async () => {
      deleteService.delete.mockRejectedValue(new Error('DB error'));

      await expect(controller.delete('ingredient-id-1')).rejects.toThrow(
        Error,
      );
    });
  });
});
