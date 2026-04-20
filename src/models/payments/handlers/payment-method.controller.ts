import {
  Controller,
  Get,
  InternalServerErrorException,
  LoggerService,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';
import { RoleGuard } from '../../../authorization/guards/role.guard';
import { Roles } from '../../../common/decorators';
import { Role } from '../../../common/enums';
import { createPageResponseSchema } from '../../../common/dto';
import { PaymentMethodsService } from '../features/payment-methods.service';
import {
  PaymentMethodQueryParamsDto,
  PaymentMethodResponseDto,
} from '../shared';
import { PaymentMethodNotFoundException } from '../shared';

@ApiTags('Payment Methods')
@ApiBearerAuth()
@Controller('payment-methods')
export class PaymentMethodController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;

  constructor(
    private readonly getPaymentMethodsService: PaymentMethodsService,
  ) {}

  // ────────────────────────────────
  // GET /payment-methods
  // ────────────────────────────────
  @Get()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiOperation({
    summary: 'Get payment methods (private)',
    description:
      'Returns paginated payment methods for internal users. ' +
      'Supports sorting and optional enabled-only filter.',
  })
  @ApiOkResponse({
    description: 'Paginated list of payment methods',
    schema: createPageResponseSchema(PaymentMethodResponseDto),
  })
  async getAll(@Query() query: PaymentMethodQueryParamsDto) {
    try {
      const paymentMethods =
        await this.getPaymentMethodsService.getPaymentMethods(
          query.toQueryParams(),
        );

      return {
        ...paymentMethods,
        items: plainToInstance(PaymentMethodResponseDto, paymentMethods.items, {
          excludeExtraneousValues: true,
        }),
      };
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  // ────────────────────────────────
  // PATCH /payment-methods/:id/toggle-status
  // ────────────────────────────────
  @Patch(':id/toggle-status')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Toggle payment method status',
    description:
      'Toggles the active status of a payment method. Only ADMIN can perform this action.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Payment method UUID' })
  @ApiOkResponse({
    description: 'Updated payment method after toggling status',
    type: PaymentMethodResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  async toggleStatus(@Param('id', new ParseUUIDPipe()) id: string) {
    try {
      const updated = await this.getPaymentMethodsService.toggleStatus(id);
      return plainToInstance(PaymentMethodResponseDto, updated, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof PaymentMethodNotFoundException) {
        throw new NotFoundException(e.message);
      }

      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}
