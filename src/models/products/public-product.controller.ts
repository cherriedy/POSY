import {
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  LoggerService,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiExtraModels,
  ApiResponse,
} from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ProductFacadeService } from './product-facade.service';
import { CurrentSession } from 'src/models/table-sessions/shared/decorators/current-session.decorator';
import { TableSession } from 'src/models/table-sessions/shared/entities/table-session';
// ...existing code...
import { plainToInstance } from 'class-transformer';
import { GetProductsService } from './get-products';
import {
  ProductPublicDetailedResponseDto,
  ProductPublicPreviewResponseDto,
  ProductPublicQueryParamsDto,
} from './dto';
import { createPageResponseSchema } from '../../common/dto';
import { ProductNotFoundException } from './exceptions';
import {
  CategoryPreviewResponseDto,
  CategoryQueryParamsDto,
  GetCategoriesService,
} from '../categories';
import { Page } from 'src/common/interfaces';
import { Response } from 'express';

@ApiTags('(Public)')
@ApiExtraModels(
  ProductPublicPreviewResponseDto,
  ProductPublicDetailedResponseDto,
)
@Controller('public')
export class PublicProductController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;

  constructor(
    private readonly getProductsService: GetProductsService,
    private readonly getCategoriesService: GetCategoriesService,
    private readonly productFacadeService: ProductFacadeService,
  ) { }

  // ────────────────────────────────
  // GET /public/products
  // ────────────────────────────────
  @Get('products')
  @ApiOperation({
    summary: 'List all available products (public)',
    description: `Returns a paginated list of active, non-deleted products.
    No authentication required. Deleted and unavailable products are always
    excluded at the query level. Supports filtering by price range, category,
    discount type, and full-text search; supports sorting by price and name.`,
  })
  @ApiQuery({
    name: 'query',
    required: false,
    type: ProductPublicQueryParamsDto,
  })
  @ApiOkResponse({
    description: 'Paginated list of public-facing product previews',
    schema: createPageResponseSchema(ProductPublicPreviewResponseDto),
  })
  async getAllProducts(@Query() query: ProductPublicQueryParamsDto) {
    try {
      const params = query.toQueryParams();

      if (!params.filter) params.filter = {};
      params.filter.isDeleted = false;
      params.filter.isAvailable = true;

      const products = await this.getProductsService.getAll(params, {
        attributes: true,
      });
      const items = plainToInstance(
        ProductPublicPreviewResponseDto,
        products.items,
        { excludeExtraneousValues: true },
      );
      return { ...products, items };
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  // ────────────────────────────────
  // GET /public/products/:id
  // ────────────────────────────────
  @Get('products/:id')
  @ApiOperation({
    summary: 'Get a single product by ID (public)',
    description: `Returns the full detail of a single available, non-deleted product.
    No authentication required. Returns 404 when the product does not exist, has been 
    soft-deleted, or is currently unavailable.`,
  })
  @ApiParam({ name: 'id', type: String, description: 'Product UUID' })
  @ApiOkResponse({
    description: 'Public-facing product detail',
    type: ProductPublicDetailedResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Product not found or not available',
  })
  async getProductById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentSession() tableSession: TableSession,
  ) {
    try {
      const product =
        await this.productFacadeService.getProductDetailWithViewEvent(
          id,
          tableSession,
        );

      return plainToInstance(
        ProductPublicDetailedResponseDto,
        { ...product, attributes: product.attributes ?? null },
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

  @Get('categories')
  @ApiOperation({
    summary: 'Get all categories',
    description: `Returns a paginated list of all categories. Accessible by MANAGER and ADMIN roles. 
      Supports filtering by query parameters such as search query (by name), active status, etc. 
      Used for listing and searching categories.`,
  })
  @ApiQuery({ name: 'query', required: false, type: CategoryQueryParamsDto })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of categories',
    schema: createPageResponseSchema(CategoryPreviewResponseDto),
  })
  async getCategories(
    @Query() query: CategoryQueryParamsDto,
  ): Promise<Page<CategoryPreviewResponseDto>> {
    try {
      const params = query.toQueryParams();

      if (!params.filter) params.filter = {};
      params.filter.isDeleted = false;

      const categoryPage = await this.getCategoriesService.getAll(params);

      const categoryPreviewItems = plainToInstance(
        CategoryPreviewResponseDto,
        categoryPage.items,
        { excludeExtraneousValues: true },
      );

      return {
        ...categoryPage,
        items: categoryPreviewItems,
      };
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }


  @Get('/momo/redirect')
  @ApiOperation({
    summary: 'MoMo payment redirect handler',
    description:
      'Handles redirect callback from MoMo after payment. Determines payment result and redirects user back to Flutter Web or App with status and orderId.',
  })
  @ApiQuery({
    name: 'resultCode',
    required: true,
    type: Number,
    description: 'MoMo result code (0 = success, others = failed)',
    example: 0,
  })
  @ApiQuery({
    name: 'orderId',
    required: true,
    type: String,
    description: 'Order ID returned from MoMo',
    example: 'facfd15d-9558-4e4b-9050-3a9b6b7c13e0',
  })
  @ApiQuery({
    name: 'extraData',
    required: false,
    type: String,
    description:
      'Optional JSON string containing metadata such as platform (web/app)',
    example: '{"platform":"web"}',
  })
  @ApiOkResponse({
    description: 'Redirects user to frontend return URL with payment result',
  })
  async momoRedirect(@Query() query: any, @Res() res: Response) {
    const isSuccess = Number(query.resultCode) === 0;

    let platform = 'web';

    try {
      if (query.extraData) {
        const parsed = JSON.parse(query.extraData);
        platform = parsed.platform || 'web';
      }
    } catch (e) {
      console.warn('Invalid extraData:', query.extraData);
    }

    const orderId = query.orderId;

    // ===== APP =====
    if (platform === 'app') {
      return res.redirect(
        `${process.env.FLUTTER_RETURN_URL_FOR_NEXTJS_WEB}?status=${isSuccess ? 'success' : 'fail'}&orderId=${orderId}`,
      );
    }

    // ===== WEB =====
    return res.redirect(
      `${process.env.FLUTTER_RETURN_URL_FOR_FLUTTER_WEB}?status=${isSuccess ? 'success' : 'fail'}&orderId=${orderId}`,
    );
  }
}
