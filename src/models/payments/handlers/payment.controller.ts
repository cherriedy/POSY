import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  InternalServerErrorException,
  LoggerService,
  Query,
  Req,
  Post,
  UseGuards,
  NotFoundException,
  Param,
  BadRequestException,
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
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Request, Response } from 'express';
import { JwtPayload } from '../../../authentication/interfaces';
import { RoleGuard } from '../../../authorization/guards/role.guard';
import { createPageResponseSchema } from '../../../common/dto';
import { Roles } from '../../../common/decorators';
import { Role } from '../../../common/enums';
import {
  PaymentCheckoutPayloadMapper,
  PaymentCheckoutService,
} from '../features/payment-checkout.service';
import { PaymentCoreService } from '../features/payment-core.service';
import { PaymentFacadeService } from '../features/payment-facade.service';
import {
  PaymentQueryParamsDto,
  PaymentResponseDto,
  CheckoutRequestDto,
  MomoCallbackPayload,
  PaymentNotFoundException,
  PaymentMethodNotFoundException,
} from '../shared';
import { PaymentRefundService } from '../features/payment-refund.service';
import {
  OrderNotFoundException,
  OrderSnapshotNotFoundException,
} from 'src/models/orders';
import {
  PromotionNotFoundException,
  PromotionUnusableException,
} from 'src/models/promotions/exceptions';
import { OrderNotReadyForCheckoutException } from 'src/models/orders/shared/exceptions/order-not-ready-for-checkout.exception';
import { UnsupportedValueException } from 'src/common/exceptions';

@ApiTags('Payments')
@ApiBearerAuth()
@ApiExtraModels(PaymentResponseDto)
@Controller('payments')
export class PaymentController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;

  constructor(
    private readonly paymentService: PaymentCoreService,
    private readonly checkoutFacadeService: PaymentCheckoutService,
    private readonly paymentRefundService: PaymentRefundService,
    private readonly paymentFacadeService: PaymentFacadeService,
  ) {}

  /**
   * Returns a paginated list of payments for MANAGER and ADMIN users.
   */
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
    try {
      const payments = await this.paymentService.getPayments(
        query.toQueryParams(),
      );

      return {
        ...payments,
        items: plainToInstance(PaymentResponseDto, payments.items, {
          excludeExtraneousValues: true,
        }),
      };
    } catch (e: unknown) {
      if (e instanceof HttpException) {
        throw e;
      }

      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
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
    try {
      const payment = await this.paymentService.getPaymentById(id);
      if (!payment) {
        throw new NotFoundException('Payment not found');
      }
      return plainToInstance(PaymentResponseDto, payment, {
        excludeExtraneousValues: true,
      });
    } catch (e: unknown) {
      if (e instanceof NotFoundException) {
        throw e;
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
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
    try {
      const payment = await this.checkoutFacadeService.execute(
        PaymentCheckoutPayloadMapper.fromDto(req.user, dto),
      );

      return plainToInstance(PaymentResponseDto, payment, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (
        e instanceof OrderNotFoundException ||
        e instanceof PaymentMethodNotFoundException ||
        e instanceof OrderSnapshotNotFoundException ||
        e instanceof PromotionNotFoundException ||
        e instanceof OrderNotReadyForCheckoutException ||
        e instanceof UnsupportedValueException ||
        e instanceof PromotionUnusableException
      ) {
        throw new BadRequestException(e.message || e.toString());
      } else if (e instanceof HttpException) {
        throw e;
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
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
    try {
      await this.paymentFacadeService.handleMomoCallback(payload);
      return { message: 'Callback processed successfully' };
    } catch (e: unknown) {
      if (e instanceof PaymentNotFoundException) {
        throw new NotFoundException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
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
    try {
      const payment = await this.paymentRefundService.execute(id);

      return plainToInstance(PaymentResponseDto, payment, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof PaymentNotFoundException) {
        throw new NotFoundException(e.message);
      } else if (e instanceof BadRequestException) {
        throw e;
      }

      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}
