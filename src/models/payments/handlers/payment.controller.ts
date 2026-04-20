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
import { Request } from 'express';
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
} from '../shared';

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
        PaymentCheckoutPayloadMapper.fromDto(req.user.sub, dto),
      );

      return plainToInstance(PaymentResponseDto, payment, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
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
}
