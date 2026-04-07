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
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiExtraModels,
} from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { plainToInstance } from 'class-transformer';
import { GetProductsService } from './get-products';
import {
  ProductPublicDetailedResponseDto,
  ProductPublicPreviewResponseDto,
  ProductPublicQueryParamsDto,
} from './dto';
import { createPageResponseSchema } from '../../common/dto';
import { ProductNotFoundException } from './exceptions';

@ApiTags('Products (Public)')
@ApiExtraModels(
  ProductPublicPreviewResponseDto,
  ProductPublicDetailedResponseDto,
)
@Controller('public/products')
export class PublicProductController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;

  constructor(private readonly getProductsService: GetProductsService) {}

  // ────────────────────────────────
  // GET /public/products
  // ────────────────────────────────
  @Get()
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
  @Get(':id')
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
  async getProductById(@Param('id', new ParseUUIDPipe()) id: string) {
    try {
      const product = await this.getProductsService.getById(id, {
        attributes: true,
      });

      // Hide soft-deleted or unavailable products from public consumers
      if (product.isDeleted || !product.isAvailable) {
        // noinspection ExceptionCaughtLocallyJS
        throw new ProductNotFoundException(id);
      }

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
}
