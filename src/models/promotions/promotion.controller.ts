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
import { CreatePromotionService } from './create-promotion/create-promotion.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreatePromotionDto } from './dto/promotion-create-request.dto';
import { PromotionCategoryPreviewResponseDto } from './dto/promotion-category-response.dto';
import { PromotionDetailedResponseDto } from './dto/promotion-detailed-response.dto';
import { PromotionPreviewResponseDto } from './dto/promotion-preview-response.dto';
import { PromotionQueryParamsDto } from './dto/promotion-query-params.dto';
import { PromotionUpdateDto } from './dto/promotion-update-request.dto';
import { Promotion } from './types/promotion.class';
import { plainToInstance } from 'class-transformer';
import { UpdatePromotionService } from './update-promotion/update-promotion.service';
import { GetPromotionsService } from './get-promotions/get-promotions.service';
import { DeletePromotionService } from './delete-promotion/delete-promotion.service';
import { ValidatePromotionService } from './validate-promotion/validate-promotion.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { PromotionProductPreviewResponseDto } from './dto/promotion-product-response.dto';
import { createPageResponseSchema } from '../../common/dto/page-response';
import { ReplacePromotionProductService } from './replace-products/replace-products.service';
import { ReplacePromotionCategoriesService } from './replace-categories/replace-categories.service';
import { BulkReplacePromotionCategoryDto } from './dto/promotion-category-replace.dto';
import { BulkReplacePromotionProductDto } from './dto/promotion-product-replace.dto';
import { GetAvailablePromotionsService } from './get-available-promotions/get-available-promotions.service';
import {
  PromotionAvailableListResponseDto,
  PromotionAvailableResponseDto,
} from './dto/promotion-available.response';

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

  // @Get('applicable/:productId')
  // @UseGuards(AuthGuard('jwt'))
  // @ApiOperation({ summary: 'Get applicable promotions for a product' })
  // @ApiParam({ name: 'productId', type: String })
  // @ApiResponse({
  //   status: 200,
  //   description: 'List of applicable promotions',
  //   type: [PromotionPreviewResponseDto],
  // })
  // async getApplicablePromotions(@Param('productId') productId: string) {
  //   try {
  //     const promotions =
  //       await this.getPromotionsService.getApplicablePromotionsForProduct(
  //         productId,
  //       );
  //     return plainToInstance(PromotionPreviewResponseDto, promotions, {
  //       excludeExtraneousValues: true,
  //     });
  //   } catch (e) {
  //     if (e instanceof ProductNotFoundException) {
  //       throw new BadRequestException(e.message);
  //     }
  //     this.logger.error(e);
  //     throw new InternalServerErrorException(
  //       'An error occurred while processing your request.',
  //     );
  //   }
  // }

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

  // @Get('/products/:id')
  // @UseGuards(AuthGuard('jwt'), RoleGuard)
  // @Roles(Role.ADMIN, Role.MANAGER)
  // @ApiOperation({
  //   summary: 'Get promotion product by ID',
  //   description: `Fetches details for a specific promotion-product relationship by its ID.
  //   Only accessible by ADMIN and MANAGER roles. Returns 400 if not found.`,
  // })
  // @ApiParam({ name: 'id', type: String })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Promotion product details',
  //   type: PromotionProductPreviewResponseDto,
  // })
  // @ApiResponse({ status: 400, description: 'Promotion product not found' })
  // async getPromotionProductById(@Param('id', new ParseUUIDPipe()) id: string) {
  //   try {
  //     const promotionProduct =
  //       await this.getPromotionsService.getPromotionProductById(id);
  //     return plainToInstance(
  //       PromotionProductPreviewResponseDto,
  //       promotionProduct,
  //       {
  //         excludeExtraneousValues: true,
  //         enableImplicitConversion: true,
  //       },
  //     );
  //   } catch (e) {
  //     if (e instanceof PromotionProductNotFoundError) {
  //       throw new BadRequestException(e.message);
  //     }
  //     this.logger.error(e);
  //     throw new InternalServerErrorException(
  //       'An error occurred while processing your request.',
  //     );
  //   }
  // }

  // @Delete('product/:id')
  // @UseGuards(AuthGuard('jwt'), RoleGuard)
  // @Roles(Role.ADMIN, Role.MANAGER)
  // @ApiOperation({
  //   summary: 'Delete a promotion product',
  //   description: `Deletes a promotion-product relationship by its ID.
  //   Only accessible by ADMIN and MANAGER roles.
  //   Returns a success message. Throws 400 if not found.`,
  // })
  // @ApiParam({ name: 'id', type: String })
  // @ApiResponse({ status: 200, description: 'Promotion product deleted' })
  // @ApiResponse({ status: 400, description: 'Promotion product not found' })
  // async deletePromotionProduct(@Param('id', new ParseUUIDPipe()) id: string) {
  //   try {
  //     await this.deletePromotionService.deletePromotionProduct(id);
  //     return { message: 'Promotion product deleted successfully.' };
  //   } catch (e) {
  //     if (e instanceof PromotionProductNotFoundError) {
  //       throw new BadRequestException(e.message);
  //     }
  //     this.logger.error(e);
  //     throw new InternalServerErrorException(
  //       'An error occurred while processing your request.',
  //     );
  //   }
  // }

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

  // @Post('validate')
  // @UseGuards(AuthGuard('jwt'))
  // @ApiOperation({
  //   summary: 'Validate a promotion for a specific product',
  //   description: `Validates if a promotion can be applied to a specific product at purchase time.
  //   Checks status, dates, usage limit, minimum value, and product/category eligibility.
  //   Used at checkout to ensure a promotion is valid for the product and context.`,
  // })
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       promotionId: {
  //         type: 'string',
  //         description: 'Promotion ID to validate',
  //       },
  //       productId: {
  //         type: 'string',
  //         description: 'Specific product ID',
  //       },
  //       productPrice: {
  //         type: 'number',
  //         description: 'Price of the specific product',
  //       },
  //       quantity: {
  //         type: 'number',
  //         description: 'Quantity of the specific product',
  //       },
  //       categoryId: {
  //         type: 'string',
  //         description:
  //           'Product category (optional, required for SPECIFIC_CATEGORIES)',
  //       },
  //     },
  //     required: ['promotionId', 'productId', 'productPrice', 'quantity'],
  //   },
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Validation result',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       isValid: { type: 'boolean' },
  //       reason: { type: 'string' },
  //       metadata: { type: 'object' },
  //     },
  //   },
  // })
  // async validatePromotion(
  //   @Body()
  //   dto: {
  //     promotionId: string;
  //     productId: string;
  //     productPrice: number;
  //     quantity: number;
  //     categoryId?: string;
  //   },
  // ) {
  //   try {
  //     return await this.validatePromotionService.validate(dto);
  //   } catch (e) {
  //     this.logger.error(e);
  //     throw new InternalServerErrorException(
  //       'An error occurred while processing your request.',
  //     );
  //   }
  // }

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
