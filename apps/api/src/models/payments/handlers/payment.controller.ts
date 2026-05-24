import {
  Body,
  Controller,
  Get,
  Query,
  Req,
  Post,
  UseGuards,
  NotFoundException,
  Param,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Request, Response } from 'express';
import { JwtPayload } from '@posy/auth';
import { RoleGuard } from '@posy/auth';
import { createPageResponseSchema } from '@posy/shared';
import { Roles } from '@posy/shared';
import { Role } from '@posy/shared';
import {
  PaymentCheckoutPayloadMapper,
  PaymentCheckoutService,
} from '../features/payment-checkout.service';
import { PaymentCoreService } from '../features/payment-core.service';
import { PaymentFacadeService } from '../features/payment-facade.service';
import { PaymentQueryParamsDto } from '../shared/dto/payment-query-params.dto';
import { PaymentResponseDto } from '../shared/dto/payment-response.dto';
import { CheckoutRequestDto } from '../shared/dto/checkout.dto';
import { MomoCallbackPayload } from '../shared/interfaces/payment-callback-payload.interface';
import { PaymentRefundService } from '../features/payment-refund.service';

@ApiTags('Payments')
@ApiBearerAuth()
@ApiExtraModels(PaymentResponseDto)
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentCoreService,
    private readonly checkoutFacadeService: PaymentCheckoutService,
    private readonly paymentRefundService: PaymentRefundService,
    private readonly paymentFacadeService: PaymentFacadeService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiOperation({
    summary: 'Get payments (private)',
    description:
      'Returns paginated payments for internal users. Accessible by MANAGER and ADMIN only.',
  })
  @ApiOkResponse({
    description: 'Paginated list of payments',
    schema: createPageResponseSchema(PaymentResponseDto),
  })
  async getAll(@Query() query: PaymentQueryParamsDto) {
    const payments = await this.paymentService.getPayments(
      query.toQueryParams(),
    );

    return {
      ...payments,
      items: plainToInstance(PaymentResponseDto, payments.items, {
        excludeExtraneousValues: true,
      }),
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiOperation({
    summary: 'Get payment by ID',
    description:
      'Returns payment details by ID. Accessible by MANAGER and ADMIN only.',
  })
  @ApiOkResponse({
    description: 'Payment details',
    type: PaymentResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  async getById(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    const payment = await this.paymentService.getPaymentById(id);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return plainToInstance(PaymentResponseDto, payment, {
      excludeExtraneousValues: true,
    });
  }

  @Post('checkout')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  @ApiOperation({
    summary: 'Process staff checkout',
    description:
      'Allows staff to checkout an order at the counter with payment method and optional promotions.',
  })
  @ApiOkResponse({
    description: 'Checkout processed successfully',
    type: PaymentResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid checkout request' })
  @ApiNotFoundResponse({
    description: 'Order, method, snapshot, or promotion not found',
  })
  async checkout(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: CheckoutRequestDto,
  ) {
    const payment = await this.checkoutFacadeService.execute(
      PaymentCheckoutPayloadMapper.fromDto(req.user, dto),
    );

    return plainToInstance(PaymentResponseDto, payment, {
      excludeExtraneousValues: true,
    });
  }

  @Post('callback/momo')
  @ApiOperation({
    summary: 'Handle MoMo payment callback',
    description:
      'Receives MoMo callback payload, verifies payment signature, and updates payment status.',
  })
  @ApiOkResponse({ description: 'MoMo callback processed successfully' })
  @ApiBadRequestResponse({ description: 'Invalid MoMo callback payload' })
  @ApiNotFoundResponse({ description: 'Payment record not found' })
  async momoCallback(@Body() payload: MomoCallbackPayload) {
    await this.paymentFacadeService.handleMomoCallback(payload);
    return { message: 'Callback processed successfully' };
  }

  @Post(':id/refund')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiOperation({
    summary: 'Refund a payment',
    description:
      'Refund a completed payment. Only COMPLETED payments can be refunded.',
  })
  @ApiOkResponse({
    description: 'Payment refunded successfully',
    type: PaymentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Payment is not eligible for refund',
  })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  async refundPayment(@Param('id') id: string) {
    const payment = await this.paymentRefundService.execute(id);

    return plainToInstance(PaymentResponseDto, payment, {
      excludeExtraneousValues: true,
    });
  }
}
