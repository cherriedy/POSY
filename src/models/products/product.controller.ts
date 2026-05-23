import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateProductDto } from './dto/product-create-request.dto';
import { ProductDetailedResponseDto } from './dto/product-detailed-response.dto';
import { ProductPreviewResponseDto } from './dto/product-preview-response.dto';
import { ProductQueryParamsDto } from './dto/product-query-params.dto';
import { UpdateProductDto } from './dto/product-update-request.dto';
import { ProductAttributeUpsertRequestDto } from './dto/product-attribute-upsert-request.dto';
import { ProductAttributeResponseDto } from './dto/product-attribute-response.dto';
import { ProductIngredientResponseDto } from './dto/product-ingredient-response.dto';
import { ProductIngredientBulkDeleteRequestDto } from './dto/product-ingredient-bulk-delete-request.dto';
import { ProductIngredientBulkDeleteItemResponseDto, ProductIngredientBulkDeleteResponseDto } from './dto/product-ingredient-bulk-delete-response.dto';
import { ProductIngredientBulkUpsertRequestDto } from './dto/product-ingredient-bulk-upsert-request.dto';
import { plainToInstance } from 'class-transformer';
import { CreateProductService } from './create-product/create-product.service';
import { UpdateProductService } from './update-product/update-product.service';
import { GetProductsService } from './get-products/get-products.service';
import { DeleteProductService } from './delete-product/delete-product.service';
import { createPageResponseSchema } from '../../common/dto/page-response.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductNotFoundException } from './exceptions/product-not-found.exception';
import { JwtPayload } from '../../authentication/interfaces/jwt-payload.interface';
import { GetAttributesService } from './get-attributes/get-attributes.service';
import { UpsertAttributesMapper } from './upsert-attributes/upsert-attributes.mapper';
import { UpsertAttributesService } from './upsert-attributes/upsert-attributes.service';
import { CreateProductMapper } from './create-product/create-product.mapper';
import { Product } from './entities/product';
import { GetProductIngredientsService } from './get-product-ingredients/get-product-ingredients.service';
import { UpsertIngredientsService } from './upsert-ingredients/upsert-ingredients.service';
import { UpsertProductIngredientsMapper } from './upsert-ingredients/upsert-ingredients.mapper';
import { RemoveProductIngredientMapper } from './remove-product-ingredient/remove-product-ingredient.mapper';
import { RemoveProductIngredientService } from './remove-product-ingredient/remove-product-ingredient.service';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductController {
  constructor(
    private readonly getProductsService: GetProductsService,
    private readonly createProductService: CreateProductService,
    private readonly updateProductService: UpdateProductService,
    private readonly deleteProductService: DeleteProductService,
    private readonly getProductAttributesService: GetAttributesService,
    private readonly upsertProductAttributesService: UpsertAttributesService,
    private readonly getProductIngredientsService: GetProductIngredientsService,
    private readonly upsertProductIngredientsService: UpsertIngredientsService,
    private readonly removeProductIngredientService: RemoveProductIngredientService,
  ) {}

  // ────────────────────────────────
  // GET /products
  // ────────────────────────────────
  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get all products',
    description: `Returns a paginated list of all products. Accessible by all authenticated users.
    Non-admin users can only see non-deleted products. Admin users can see all products including
    deleted ones by setting isDeleted filter. Supports filtering by query parameters such as price,
    category, discount type, stock, etc. Used for listing and searching products.`,
  })
  @ApiQuery({ name: 'query', required: false, type: ProductQueryParamsDto })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of products',
    schema: createPageResponseSchema(ProductPreviewResponseDto),
  })
  async getAll(@Query() query: ProductQueryParamsDto, @Req() req: Request) {
    const role = (req.user as JwtPayload).role;
    const queryParams = query.toQueryParams();

    // Non-admin users cannot see deleted products
    if (role !== Role.ADMIN.toString()) {
      if (!queryParams.filter) queryParams.filter = {};
      queryParams.filter.isDeleted = false;
    }

    const products = await this.getProductsService.getAll(queryParams);
    const items = plainToInstance(ProductPreviewResponseDto, products.items, {
      excludeExtraneousValues: true,
    });
    return { ...products, items };
  }

  // ────────────────────────────────
  // GET /products/available
  // ────────────────────────────────
  @Get('available')
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Get available products',
    description: 'Returns available and non-deleted products',
  })
  async getAvailableProducts(): Promise<ProductPreviewResponseDto[]> {
    const productPage = await this.getProductsService.getAll({
      filter: {
        isAvailable: true,
        isDeleted: false,
      },
      page: 1,
      pageSize: 1000,
    });

    return plainToInstance(ProductPreviewResponseDto, productPage.items, {
      excludeExtraneousValues: true,
    });
  }

  // ────────────────────────────────
  // GET /products/:id
  // ────────────────────────────────
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get product by ID',
    description: `Fetches detailed information for a specific product by its unique ID. Accessible by
    all authenticated users. Non-admin users cannot access deleted products. Returns 400 if the product
    is not found or if a non-admin user tries to access a deleted product.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    type: ProductDetailedResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Product not found' })
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request,
  ) {
    const userRole = (req.user as JwtPayload).role;
    const product = await this.getProductsService.getById(id);

    // Non-admin users cannot access deleted products
    if (userRole !== Role.ADMIN.toString() && product.isDeleted) {
      throw new ProductNotFoundException(id);
    }

    return plainToInstance(ProductDetailedResponseDto, product, {
      excludeExtraneousValues: true,
    });
  }

  // ────────────────────────────────
  // POST /products
  // ────────────────────────────────
  @Post()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Create a new product',
    description: `Creates a new product with the provided details. Optionally create product attributes
    along with the product by providing an 'attributes' field in the request body. Only accessible by
    ADMIN role. Returns the created product preview. Throws 400 for duplicate entries.`,
  })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Product created',
    type: ProductPreviewResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Duplicate entry' })
  async create(@Body() dto: CreateProductDto) {
    const payload = CreateProductMapper.toPayload(dto);
    const product = await this.createProductService.create(payload);
    return plainToInstance(ProductPreviewResponseDto, product, {
      excludeExtraneousValues: true,
    });
  }

  // ────────────────────────────────
  // PUT /products/:id
  // ────────────────────────────────
  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Update a product',
    description: `Updates an existing product by its ID. Only accessible by ADMIN role.
    Returns the updated product preview. Throws 400 for not found or duplicate entries.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'Product updated',
    type: ProductPreviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Product not found or duplicate entry',
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    const product = await this.updateProductService.update(
      id,
      dto as unknown as Partial<Product>,
    );
    return plainToInstance(ProductPreviewResponseDto, product, {
      excludeExtraneousValues: true,
    });
  }

  // ────────────────────────────────
  // DELETE /products/:id
  // ────────────────────────────────
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Delete a product',
    description: `Deletes a product by its ID. Only accessible by ADMIN role.
    Returns a success message. Throws 400 if the product is not found.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 400, description: 'Product not found' })
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.deleteProductService.delete(id);
    return { message: 'Product deleted successfully.' };
  }

  // ────────────────────────────────
  // GET /products/:id/attributes
  // ────────────────────────────────
  @Get(':id/attributes')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiOperation({
    summary: 'Get product attributes',
    description: 'Fetches product attributes for a specific product by its ID.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product attributes retrieved',
    type: ProductAttributeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product attributes not found' })
  async getProductAttributes(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ProductAttributeResponseDto | null> {
    const attributes =
      await this.getProductAttributesService.getByProductId(id);
    if (!attributes) {
      return null;
    }
    return plainToInstance(ProductAttributeResponseDto, attributes, {
      excludeExtraneousValues: true,
    });
  }

  // ────────────────────────────────
  // PUT /products/:id/attributes
  // ────────────────────────────────
  @Post(':id/attributes')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiOperation({
    summary: 'Create or update product attributes',
    description:
      'Creates new product attributes or updates existing ones for a product.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Product ID' })
  @ApiBody({ type: ProductAttributeUpsertRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Product attributes created/updated successfully',
    type: ProductAttributeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or product not found',
  })
  async upsertProductAttributes(
    @Param('id', new ParseUUIDPipe()) productId: string,
    @Body() dto: ProductAttributeUpsertRequestDto,
  ): Promise<ProductAttributeResponseDto> {
    const payload = UpsertAttributesMapper.toPayload(productId, dto);
    const attrs = await this.upsertProductAttributesService.upsert(payload);
    return plainToInstance(ProductAttributeResponseDto, attrs, {
      excludeExtraneousValues: true,
    });
  }

  // ────────────────────────────────
  // GET /products/:id/ingredients
  // ────────────────────────────────
  @Get(':id/ingredients')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiOperation({
    summary: 'Get product ingredients',
    description: 'Fetches all ingredients for a specific product by its ID.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product ingredients retrieved',
    type: [ProductIngredientResponseDto],
  })
  async getProductIngredients(
    @Param('id', new ParseUUIDPipe()) productId: string,
  ): Promise<ProductIngredientResponseDto[]> {
    const ingredients =
      await this.getProductIngredientsService.getByProductId(productId);

    return plainToInstance(ProductIngredientResponseDto, ingredients, {
      excludeExtraneousValues: true,
    });
  }

  // ────────────────────────────────
  // PUT /products/:id/ingredients
  // ────────────────────────────────
  @Post(':id/ingredients')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiOperation({
    summary: 'Upsert product ingredients',
    description: `Bulk-upserts ingredients for a product. Existing ingredient associations
     are updated with the new quantity; new ones are inserted. All operations are performed atomically.`,
  })
  @ApiParam({ name: 'id', type: String, description: 'Product ID' })
  @ApiBody({ type: ProductIngredientBulkUpsertRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Product ingredients upserted successfully',
    type: [ProductIngredientResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or product not found',
  })
  async upsertProductIngredients(
    @Param('id', new ParseUUIDPipe()) productId: string,
    @Body() dto: ProductIngredientBulkUpsertRequestDto,
  ): Promise<ProductIngredientResponseDto[]> {
    const payload = UpsertProductIngredientsMapper.toPayload(productId, dto);
    const result = await this.upsertProductIngredientsService.upsert(payload);
    return plainToInstance(ProductIngredientResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  // ────────────────────────────────
  // DELETE /products/:id/ingredients
  // ────────────────────────────────
  @Delete(':id/ingredients')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiOperation({
    summary: 'Remove ingredients from product',
    description: `Bulk-removes ingredients from a product using the Per-Item Result pattern.
    Provide an array of ingredient IDs to remove. Each ingredient is processed independently
    within its own transaction.`,
  })
  @ApiParam({ name: 'id', type: String, description: 'Product ID' })
  @ApiBody({ type: ProductIngredientBulkDeleteRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Per-item result with summary counts.',
    type: ProductIngredientBulkDeleteResponseDto,
  })
  async DeleteProductIngredients(
    @Param('id', new ParseUUIDPipe()) productId: string,
    @Body() dto: ProductIngredientBulkDeleteRequestDto,
  ): Promise<ProductIngredientBulkDeleteResponseDto> {
    const results = await this.removeProductIngredientService.bulkDelete(
      RemoveProductIngredientMapper.toPayload(productId, dto),
    );
    const items = plainToInstance(
      ProductIngredientBulkDeleteItemResponseDto,
      results.map((r) => ({
        id: r.id,
        status: r.status,
        error: r.error,
      })),
      { excludeExtraneousValues: true },
    );

    return plainToInstance(
      ProductIngredientBulkDeleteResponseDto,
      {
        items,
        total: items.length,
        succeeded: items.filter((i) => i.status === 'SUCCEED').length,
        failed: items.filter((i) => i.status === 'FAILED').length,
      },
      { excludeExtraneousValues: true },
    );
  }
}
