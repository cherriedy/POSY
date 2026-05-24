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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@posy/auth';
import { Roles, Role, createPageResponseSchema } from '@posy/shared';
import { plainToInstance } from 'class-transformer';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { CreatePromotionService } from '@posy/promotions/features/create-promotion/create-promotion.service';
import { UpdatePromotionService } from '@posy/promotions/features/update-promotion/update-promotion.service';
import { GetPromotionsService } from '@posy/promotions/features/get-promotions/get-promotions.service';
import { DeletePromotionService } from '@posy/promotions/features/delete-promotion/delete-promotion.service';
import { ValidatePromotionService } from '@posy/promotions/features/validate-promotion/validate-promotion.service';
import { ReplacePromotionCategoriesService } from '@posy/promotions/features/replace-categories/replace-categories.service';
import { ReplacePromotionProductService } from '@posy/promotions/features/replace-products/replace-products.service';
import { GetAvailablePromotionsService } from '@posy/promotions/features/get-available-promotions/get-available-promotions.service';
import { CreatePromotionDto } from '@posy/promotions/shared/dto/promotion-create-request.dto';
import { PromotionCategoryPreviewResponseDto } from '@posy/promotions/shared/dto/promotion-category-response.dto';
import { PromotionDetailedResponseDto } from '@posy/promotions/shared/dto/promotion-detailed-response.dto';
import { PromotionPreviewResponseDto } from '@posy/promotions/shared/dto/promotion-preview-response.dto';
import { PromotionQueryParamsDto } from '@posy/promotions/shared/dto/promotion-query-params.dto';
import { PromotionUpdateDto } from '@posy/promotions/shared/dto/promotion-update-request.dto';
import { PromotionProductPreviewResponseDto } from '@posy/promotions/shared/dto/promotion-product-response.dto';
import { BulkReplacePromotionCategoryDto } from '@posy/promotions/shared/dto/promotion-category-replace.dto';
import { BulkReplacePromotionProductDto } from '@posy/promotions/shared/dto/promotion-product-replace.dto';
import {
  PromotionAvailableListResponseDto,
  PromotionAvailableResponseDto,
} from '@posy/promotions/shared/dto/promotion-available-response.dto';
import { Promotion } from '@posy/promotions/shared/entities/promotion';

@ApiTags('Promotions')
@ApiBearerAuth()
@Controller('promotions')
export class PromotionController {
  constructor(
    private readonly getPromotionsService: GetPromotionsService,
    private readonly createPromotionService: CreatePromotionService,
    private readonly updatePromotionService: UpdatePromotionService,
    private readonly replacePromotionCategoriesService: ReplacePromotionCategoriesService,
    private readonly replacePromotionProductsService: ReplacePromotionProductService,
    private readonly deletePromotionService: DeletePromotionService,
    private readonly validatePromotionService: ValidatePromotionService,
    private readonly getAvailablePromotionsService: GetAvailablePromotionsService,
  ) {}

  @Get('categories')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Get all promotion categories',
    description: `Returns a list of all promotion categories in the system.
    Accessible only by ADMIN and MANAGER roles.
    Used for management and assignment of promotions to categories.`,
  })
  @ApiResponse({
    status: 200,
    description: 'List of promotion categories',
    type: [PromotionCategoryPreviewResponseDto],
  })
  async getPromotionCategories() {
    const promotionCategories =
      await this.getPromotionsService.getPromotionCategories();
    return plainToInstance(
      PromotionCategoryPreviewResponseDto,
      promotionCategories,
      {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      },
    );
  }

  @Get(':id/categories')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Get categories of a promotion',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'List of categories of the promotion',
    type: [PromotionCategoryPreviewResponseDto],
  })
  async getPromotionCategoriesById(
    @Param('id', new ParseUUIDPipe()) promotionId: string,
  ) {
    const result =
      await this.getPromotionsService.getPromotionCategoriesByPromotionId(
        promotionId,
      );

    return plainToInstance(PromotionCategoryPreviewResponseDto, result, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  @Put(':id/categories')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Replace promotion categories',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: BulkReplacePromotionCategoryDto })
  async replacePromotionCategories(
    @Param('id', new ParseUUIDPipe()) promotionId: string,
    @Body() dto: BulkReplacePromotionCategoryDto,
  ) {
    const result =
      await this.replacePromotionCategoriesService.replacePromotionCategories(
        promotionId,
        dto.categoryIds,
      );

    return plainToInstance(PromotionCategoryPreviewResponseDto, result, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  @Get('products')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Get all promotion products',
    description: `Returns a list of all products that have promotions assigned.
    Accessible only by ADMIN and MANAGER roles. Useful for managing product-level promotions.`,
  })
  @ApiResponse({
    status: 200,
    description: 'List of promotion products',
    type: [PromotionProductPreviewResponseDto],
  })
  async getPromotionProducts() {
    const promotionProducts =
      await this.getPromotionsService.getPromotionProducts();
    return plainToInstance(
      PromotionProductPreviewResponseDto,
      promotionProducts,
      {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      },
    );
  }

  @Get(':id/products')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Get products of a promotion',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'List of products of the promotion',
    type: [PromotionProductPreviewResponseDto],
  })
  async getPromotionProductsById(
    @Param('id', new ParseUUIDPipe()) promotionId: string,
  ) {
    const result =
      await this.getPromotionsService.getPromotionProductsByPromotionId(
        promotionId,
      );

    return plainToInstance(PromotionProductPreviewResponseDto, result, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  @Put(':id/products')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Bulk replace promotion products',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: BulkReplacePromotionProductDto })
  @ApiResponse({
    status: 201,
    description: 'Promotion products synced',
    type: [PromotionProductPreviewResponseDto],
  })
  async bulkReplacePromotionProducts(
    @Param('id', new ParseUUIDPipe()) promotionId: string,
    @Body() dto: BulkReplacePromotionProductDto,
  ) {
    const result =
      await this.replacePromotionProductsService.replacePromotionProducts(
        promotionId,
        dto.productIds,
      );

    return plainToInstance(PromotionProductPreviewResponseDto, result, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  @Get('by-code/:code')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get promotion by code',
    description: `Fetches detailed information for a specific promotion by its unique code.
    Accessible by all authenticated users. Returns 400 if the promotion is not found.`,
  })
  @ApiParam({ name: 'code', type: String })
  @ApiResponse({
    status: 200,
    description: 'Promotion details',
    type: PromotionDetailedResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Promotion not found' })
  async getByCode(@Param('code') code: string) {
    const promotion = await this.getPromotionsService.getByCode(code);
    return plainToInstance(PromotionDetailedResponseDto, promotion, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get all promotions',
    description: `Returns a paginated list of all promotions.
    Accessible by all authenticated users.
    Supports filtering by query parameters such as status, type, applicability, etc.
    Used for listing and searching promotions.`,
  })
  @ApiQuery({ name: 'query', required: false, type: PromotionQueryParamsDto })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of promotions',
    schema: createPageResponseSchema(PromotionPreviewResponseDto),
  })
  async getAll(@Query() query: PromotionQueryParamsDto) {
    const promotions = await this.getPromotionsService.getAll(
      query.toQueryParams(),
    );
    const items = plainToInstance(
      PromotionPreviewResponseDto,
      promotions.items,
      {
        excludeExtraneousValues: true,
      },
    );
    return { ...promotions, items };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get promotion by ID',
    description: `Fetches detailed information for a specific promotion by its unique ID.
    Accessible by all authenticated users. Returns 400 if the promotion is not found.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Promotion details',
    type: PromotionDetailedResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Promotion not found' })
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    const promotion = await this.getPromotionsService.getById(id);
    return plainToInstance(PromotionDetailedResponseDto, promotion, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Create a new promotion',
    description: `Creates a new promotion with the provided details.
    Only accessible by ADMIN and MANAGER roles. Returns the created promotion preview.
    Throws 400 for duplicate entries.`,
  })
  @ApiBody({ type: CreatePromotionDto })
  @ApiResponse({
    status: 201,
    description: 'Promotion created',
    type: PromotionPreviewResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Duplicate entry' })
  async create(@Body() dto: CreatePromotionDto) {
    const promotion = await this.createPromotionService.create(
      dto as unknown as Promotion,
    );
    return plainToInstance(PromotionPreviewResponseDto, promotion, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Update a promotion',
    description: `Updates an existing promotion by its ID.
    Only accessible by ADMIN and MANAGER roles.
    Returns the updated promotion preview.
    Throws 400 for not found or duplicate entries.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: PromotionUpdateDto })
  @ApiResponse({
    status: 200,
    description: 'Promotion updated',
    type: PromotionPreviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Promotion not found or duplicate entry',
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: PromotionUpdateDto,
  ) {
    const promotion = await this.updatePromotionService.update(id, dto);
    return plainToInstance(PromotionPreviewResponseDto, promotion, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Delete a promotion',
    description: `Deletes a promotion by its ID.
    Only accessible by ADMIN and MANAGER roles.
    Returns a success message. Throws 400 if the promotion is not found.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Promotion deleted' })
  @ApiResponse({ status: 400, description: 'Promotion not found' })
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.deletePromotionService.delete(id);
    return { message: 'Promotion deleted successfully.' };
  }

  @Get('available/:orderId')
  @ApiOperation({
    summary: 'Get available promotions',
    description: ` Returns all active promotions and evaluates their eligibility based on the given order data.
    Includes both eligible and ineligible promotions. Each promotion contains: isEligible flag, ineligibleReasons list
`,
  })
  @ApiResponse({
    status: 200,
    description: 'List of available promotions with eligibility status',
    type: PromotionAvailableListResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getAvailable(@Param('orderId') orderId: string) {
    const promotions =
      await this.getAvailablePromotionsService.execute(orderId);

    const items = plainToInstance(PromotionAvailableResponseDto, promotions, {
      excludeExtraneousValues: true,
    });

    return {
      items,
      total: items.length,
    };
  }
}
