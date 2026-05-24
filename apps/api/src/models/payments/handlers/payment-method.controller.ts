import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
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
import { RoleGuard } from '../../../authorization/guards/role.guard';
import { Roles } from '@posy/shared';
import { Role } from '@posy/shared';
import { createPageResponseSchema } from '@posy/shared';
import { PaymentMethodsService } from '../features/payment-methods.service';
import { PaymentMethodQueryParamsDto } from '../shared/dto/payment-method-query-params.dto';
import { PaymentMethodResponseDto } from '../shared/dto/payment-method-responses.dto';

@ApiTags('Payment Methods')
@ApiBearerAuth()
@Controller('payment-methods')
export class PaymentMethodController {
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
  }

  // ────────────────────────────────
  // POST /payment-methods/:id/toggle-active
  // ────────────────────────────────
  @Post(':id/toggle-active')
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
    const updated = await this.getPaymentMethodsService.toggleStatus(id);
    return plainToInstance(PaymentMethodResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }
}
