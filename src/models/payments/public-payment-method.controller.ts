import {
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  LoggerService,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiTags,
  ApiExtraModels,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { createPageResponseSchema } from '../../common/dto';
import { PaymentMethodsService } from './features/payment-methods.service';
import {
  PublicPaymentMethodQueryParamsDto,
  PublicPaymentMethodResponseDto,
} from './shared';

@ApiTags('(Public)')
@ApiExtraModels(PublicPaymentMethodResponseDto)
@Controller('public/payment-methods')
export class PublicPaymentMethodController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;

  constructor(
    private readonly getPaymentMethodsService: PaymentMethodsService,
  ) {}

  // ────────────────────────────────
  // GET /public/payment-methods
  // ────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Get payment methods (public)',
    description:
      'Returns a paginated list of enabled payment methods only. ' +
      'Sorting options are intentionally not exposed for public requests.',
  })
  @ApiOkResponse({
    description: 'Paginated list of public payment methods',
    schema: createPageResponseSchema(PublicPaymentMethodResponseDto),
  })
  async getAll(@Query() query: PublicPaymentMethodQueryParamsDto) {
    try {
      const paymentMethods =
        await this.getPaymentMethodsService.getPaymentMethods(
          query.toQueryParams(),
        );

      return {
        ...paymentMethods,
        items: plainToInstance(
          PublicPaymentMethodResponseDto,
          paymentMethods.items,
          { excludeExtraneousValues: true },
        ),
      };
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}
