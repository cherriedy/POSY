import {
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  LoggerService,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { createPageResponseSchema } from '../../common/dto';
import { Roles } from '../../common/decorators';
import { Role } from '../../common/enums';
import { PaymentService } from './features/payment.service';
import { PaymentQueryParamsDto, PaymentResponseDto } from './shared';

@ApiTags('Payments')
@ApiBearerAuth()
@ApiExtraModels(PaymentResponseDto)
@Controller('payments')
export class PaymentController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;

  constructor(private readonly paymentService: PaymentService) {}

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
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}
