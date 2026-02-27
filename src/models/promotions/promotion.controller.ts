import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreatePromotionService } from './create-promotion/create-promotion.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { Roles } from '../../common/decorators';
import { Role } from '../../common/enums';
import {
  CreatePromotionDto,
  PromotionCategoryPreviewResponseDto,
  PromotionDetailedResponseDto,
  PromotionPreviewResponseDto,
  PromotionQueryParamsDto,
  PromotionUpdateDto,
} from './dto';
import { Promotion, PromotionCategory, PromotionProduct } from './types';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { DuplicateEntryException, RelatedRecordNotFoundException } from '../../common/exceptions';
import { plainToInstance } from 'class-transformer';
import { UpdatePromotionService } from './update-promotion/update-promotion.service';
import {
  PromotionCategoryNotFoundException,
  PromotionNotFoundException,
  PromotionProductNotFoundException,
} from './exceptions';
import { GetPromotionsService } from './get-promotions/get-promotions.service';
import { DeletePromotionService } from './delete-promotion/delete-promotion.service';
import { ValidatePromotionService } from './validate-promotion/validate-promotion.service';
import { PromotionUnusableException } from './exceptions/PromotionUnusableException';
import { CategoriesNotFoundException, CategoryNotFoundException } from '../categories/exceptions';
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
import { Request } from 'express';
import { JwtPayload } from '../../authentication/interfaces';
import { ProductNotFoundException, ProductsNotFoundException } from '../products/exceptions';
import { createPageResponseSchema } from '../../common/dto';
import { BulkDeletePromotionCategoryDto } from './dto/promotion-category-delete-request.dto';
import { BulkCreatePromotionCategoryDto } from './dto/promotion-category-create.dto';
import { ZonesNotFoundException } from '../zones/exceptions';
import { el } from '@faker-js/faker/.';
import { FloorsNotFoundException } from '../floors/exceptions';
import { BulkCreatePromotionProductDto } from './dto/promotion-product-create.dto';

@ApiTags('Promotion')
@ApiBearerAuth()
@Controller('promotions')
export class PromotionController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(
    private readonly getPromotionsService: GetPromotionsService,
    private readonly createPromotionService: CreatePromotionService,
    private readonly updatePromotionService: UpdatePromotionService,
    private readonly deletePromotionService: DeletePromotionService,
    private readonly validatePromotionService: ValidatePromotionService,
  ) { }

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
    try {
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
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
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
    @Param('id') promotionId: string,
  ) {
    try {
      const result =
        await this.getPromotionsService.getPromotionCategoriesByPromotionId(promotionId);

      return plainToInstance(
        PromotionCategoryPreviewResponseDto,
        result,
        {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        },
      );
    } catch (e) {
      if (e instanceof PromotionNotFoundException) {
        throw new NotFoundException({ message: e.message });
      }

      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post(':id/categories')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Bulk add categories to a promotion',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: BulkCreatePromotionCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Promotion categories created',
    type: [PromotionCategoryPreviewResponseDto],
  })
  async bulkCreatePromotionCategories(
    @Param('id') promotionId: string,
    @Body() dto: BulkCreatePromotionCategoryDto,
  ) {
    try {
      const result =
        await this.createPromotionService.bulkCreatePromotionCategories(
          promotionId,
          dto.categoryIds,
        );

      return plainToInstance(
        PromotionCategoryPreviewResponseDto,
        result,
        {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        },
      );
    } catch (e) {
      if (
        e instanceof PromotionNotFoundException ||
        e instanceof CategoriesNotFoundException
      ) {
        const response: any = { message: e.message };
        if ((e as any).meta) {
          response.meta = (e as any).meta;
        }
        throw new NotFoundException(response);
      } else if (
        e instanceof DuplicateEntryException ||
        e instanceof PromotionUnusableException
      ) {
        const response: any = { message: e.message };
        if ((e as any).meta) {
          response.meta = (e as any).meta;
        }
        throw new BadRequestException(response);
      }

      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post(':id/categories/delete')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Bulk delete categories from a promotion',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: BulkDeletePromotionCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Bulk delete success',
  })
  async bulkDeletePromotionCategories(
    @Param('id') promotionId: string,
    @Body() dto: BulkDeletePromotionCategoryDto,
  ) {
    try {
      await this.deletePromotionService.deletePromotionCategoriesByCategoryIds(
        promotionId,
        dto.categoryIds,
      );

      return { message: 'Bulk delete success' };
    } catch (e) {
      if (e instanceof PromotionNotFoundException) {
        throw new BadRequestException({ message: e.message });
      } else if (e instanceof CategoriesNotFoundException) {
        throw new NotFoundException({ message: e.message, meta: (e as any).meta });
      } else if (e instanceof RelatedRecordNotFoundException) {
        throw new NotFoundException({ message: e.message });
      }

      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
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
    try {
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
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Get('applicable/:productId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get applicable promotions for a product' })
  @ApiParam({ name: 'productId', type: String })
  @ApiResponse({
    status: 200,
    description: 'List of applicable promotions',
    type: [PromotionPreviewResponseDto],
  })
  async getApplicablePromotions(@Param('productId') productId: string) {
    try {
      const promotions =
        await this.getPromotionsService.getApplicablePromotionsForProduct(
          productId,
        );
      return plainToInstance(PromotionPreviewResponseDto, promotions, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof ProductNotFoundException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
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
    @Param('id') promotionId: string,
  ) {
    try {
      const result =
        await this.getPromotionsService.getPromotionProductsByPromotionId(promotionId);

      return plainToInstance(
        PromotionProductPreviewResponseDto,
        result,
        {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        },
      );
    } catch (e) {
      if (e instanceof PromotionNotFoundException) {
        throw new NotFoundException({ message: e.message });
      }

      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post(':id/products')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Bulk add products to a promotion',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: BulkCreatePromotionProductDto })
  @ApiResponse({
    status: 201,
    description: 'Promotion products created',
    type: [PromotionProductPreviewResponseDto],
  })
  async bulkCreatePromotionProducts(
    @Param('id') promotionId: string,
    @Body() dto: BulkCreatePromotionProductDto,
  ) {
    try {
      const result =
        await this.createPromotionService.bulkCreatePromotionProducts(
          promotionId,
          dto.productIds,
        );

      return plainToInstance(
        PromotionProductPreviewResponseDto,
        result,
        {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        },
      );
    } catch (e) {
      if (
        e instanceof PromotionNotFoundException ||
        e instanceof ProductsNotFoundException
      ) {
        const response: any = { message: e.message };
        if ((e as any).meta) {
          response.meta = (e as any).meta;
        }
        throw new NotFoundException(response);
      } else if (
        e instanceof DuplicateEntryException ||
        e instanceof PromotionUnusableException
      ) {
        const response: any = { message: e.message };
        if ((e as any).meta) {
          response.meta = (e as any).meta;
        }
        throw new BadRequestException(response);
      }

      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post(':id/products/delete')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Bulk delete products from a promotion',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: BulkDeletePromotionCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Bulk delete success',
  })
  async bulkDeletePromotionProducts(
    @Param('id') promotionId: string,
    @Body() dto: BulkCreatePromotionProductDto,
  ) {
    try {
      await this.deletePromotionService.deletePromotionProductsByProductIds(
        promotionId,
        dto.productIds,
      );

      return { message: 'Bulk delete success' };
    } catch (e) {
      if (e instanceof PromotionNotFoundException) {
        throw new BadRequestException({ message: e.message });
      } else if (e instanceof ProductsNotFoundException) {
        throw new NotFoundException({ message: e.message, meta: (e as any).meta });
      } else if (e instanceof RelatedRecordNotFoundException) {
        throw new NotFoundException({ message: e.message });
      }

      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
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
  // async getPromotionProductById(@Param('id') id: string) {
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
  //     if (e instanceof PromotionProductNotFoundException) {
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
  // async deletePromotionProduct(@Param('id') id: string) {
  //   try {
  //     await this.deletePromotionService.deletePromotionProduct(id);
  //     return { message: 'Promotion product deleted successfully.' };
  //   } catch (e) {
  //     if (e instanceof PromotionProductNotFoundException) {
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
    try {
      const promotion = await this.getPromotionsService.getByCode(code);
      return plainToInstance(PromotionDetailedResponseDto, promotion, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof PromotionNotFoundException) {
        throw new NotFoundException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Get('by-product/:productId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get promotions by product ID',
    description: `Returns all promotions for a specific product. 
    For STAFF users, only active and non-deleted promotions are returned. 
    For ADMIN and MANAGER, all promotions (including deleted/disabled) are returned. 
    Used for checking which promotions are linked to a product.`,
  })
  @ApiParam({ name: 'productId', type: String })
  @ApiResponse({
    status: 200,
    description: 'List of promotions for the product',
    type: [PromotionPreviewResponseDto],
  })
  async getPromotionsByProductId(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() req: Request,
  ) {
    try {
      const role = (req.user as JwtPayload).role;

      const promotions =
        await this.getPromotionsService.getPromotionsByProductId(
          productId,
          role,
        );

      return plainToInstance(
        PromotionPreviewResponseDto,
        promotions,
        { excludeExtraneousValues: true },
      );

    } catch (e) {
      if (e instanceof ProductNotFoundException) {
        throw new NotFoundException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Get('by-category/:categoryId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get promotions by category ID',
    description: `Returns all promotions for a specific category. 
    For STAFF users, only active and non-deleted promotions are returned. 
    For ADMIN and MANAGER, all promotions (including deleted/disabled) are returned. 
    Used for checking which promotions are linked to a category.`,
  })
  @ApiParam({ name: 'categoryId', type: String })
  @ApiResponse({
    status: 200,
    description: 'List of promotions for the category',
    type: [PromotionPreviewResponseDto],
  })
  async getPromotionsByCategoryId(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Req() req: Request,
  ) {
    try {
      const role = (req.user as JwtPayload).role;
      const promotions =
        await this.getPromotionsService.getPromotionsByCategoryId(
          categoryId,
          role,
        );
      return plainToInstance(PromotionPreviewResponseDto, promotions, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof CategoryNotFoundException) {
        throw new NotFoundException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
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
    try {
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
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
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
  async getById(@Param('id') id: string) {
    try {
      const promotion = await this.getPromotionsService.getById(id);
      return plainToInstance(PromotionDetailedResponseDto, promotion, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof PromotionNotFoundException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
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
    try {
      const promotion = await this.createPromotionService.create(
        dto as unknown as Promotion,
      );
      return plainToInstance(PromotionPreviewResponseDto, promotion, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof DuplicateEntryException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
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
  async update(@Param('id') id: string, @Body() dto: PromotionUpdateDto) {
    try {
      const promotion = await this.updatePromotionService.update(id, dto);
      return plainToInstance(PromotionPreviewResponseDto, promotion, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof PromotionNotFoundException) {
        throw new BadRequestException(e.message);
      } else if (e instanceof DuplicateEntryException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
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
  async delete(@Param('id') id: string) {
    try {
      await this.deletePromotionService.delete(id);
      return { message: 'Promotion deleted successfully.' };
    } catch (e) {
      if (e instanceof PromotionNotFoundException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post('validate')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Validate a promotion for a specific product',
    description: `Validates if a promotion can be applied to a specific product at purchase time. 
    Checks status, dates, usage limit, minimum value, and product/category eligibility. 
    Used at checkout to ensure a promotion is valid for the product and context.`,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        promotionId: {
          type: 'string',
          description: 'Promotion ID to validate',
        },
        productId: {
          type: 'string',
          description: 'Specific product ID',
        },
        productPrice: {
          type: 'number',
          description: 'Price of the specific product',
        },
        quantity: {
          type: 'number',
          description: 'Quantity of the specific product',
        },
        categoryId: {
          type: 'string',
          description:
            'Product category (optional, required for SPECIFIC_CATEGORIES)',
        },
      },
      required: ['promotionId', 'productId', 'productPrice', 'quantity'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Validation result',
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean' },
        reason: { type: 'string' },
        metadata: { type: 'object' },
      },
    },
  })
  async validatePromotion(
    @Body()
    dto: {
      promotionId: string;
      productId: string;
      productPrice: number;
      quantity: number;
      categoryId?: string;
    },
  ) {
    try {
      return await this.validatePromotionService.validate(dto);
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}
