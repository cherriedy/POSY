import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  LoggerService,
  Patch,
  Post,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { OrderCreateRequestDto } from '../shared/dto/order-create-request.dto';
import { OrderDetailedResponseDto } from '../shared/dto/order-detailed-response.dto';
import { OrderPreviewResponseDto } from '../shared/dto/order-preview-response.dto';
import { OrderUpdateRequestDto } from '../shared/dto/order-update-request.dto';
import { OrderNotFoundException } from '../shared/exceptions/order-not-found.exception';
import { CurrentSession } from '../../table-sessions/shared/decorators/current-session.decorator';
import { TableSession } from '../../table-sessions/shared/entities/table-session';
import { TableSessionGuard } from '../../table-sessions/shared/guards/table-session.guard';
import { AtLeastOneItemRequiredException } from '../../../common/exceptions/at-least-one-item-required.exception';
import { DuplicateEntryException } from '../../../common/exceptions/DuplicateEntryException';
import { ForeignKeyViolationException } from '../../../common/exceptions/ForeignKeyViolationException';
import { ProductNotFoundException } from '../../products/exceptions/product-not-found.exception';
import { TableNotFoundException } from '../../tables/exceptions/table-not-found.exception';
import { OrderModificationForbiddenException } from '../shared/exceptions/order-modification-forbidden.exception';
import { toPayload as toCreateOrderPayload } from '../services/create-order.service';
import { UpdateOrderService } from '../services/update-order.service';
import { OrderFacadeService } from '../services/order-facade.service';

@ApiTags('Orders (Guest)')
@ApiExtraModels(OrderPreviewResponseDto, OrderDetailedResponseDto)
@UseGuards(TableSessionGuard)
@ApiCookieAuth('session_token')
@Controller('guest/orders')
export class GuestOrderController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;

  constructor(
    private readonly updateOrderService: UpdateOrderService,
    private readonly orderFacadeService: OrderFacadeService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get order (Guest)',
    description: `Returns a single order. Accessible by the QR-scanned device session.`,
  })
  @ApiOkResponse({
    description: 'Order details',
    type: OrderDetailedResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  async getById(@CurrentSession() tableSession: TableSession) {
    try {
      const { id: sessionId } = tableSession;
      return await this.orderFacadeService.getOrderWithRecommendations(
        sessionId!,
      );
    } catch (e) {
      if (e instanceof OrderNotFoundException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new order (Guest)',
    description: `Creates a new order for a table session. Accessible by the device
    that originally scanned the QR code. The tableId and sessionId are
    automatically extracted from the session cookie.`,
  })
  @ApiCreatedResponse({
    description: 'Order created successfully',
    type: OrderDetailedResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'No valid session cookie provided',
  })
  async create(
    @Body() dto: OrderCreateRequestDto,
    @CurrentSession() tableSession: TableSession,
  ) {
    try {
      const { tableId, id: sessionId } = tableSession;
      return await this.orderFacadeService.createOrderWithRecommendations(
        toCreateOrderPayload(dto.items, tableId, sessionId!, null, dto.note),
      );
    } catch (e) {
      if (
        e instanceof DuplicateEntryException ||
        e instanceof ProductNotFoundException ||
        e instanceof TableNotFoundException ||
        e instanceof AtLeastOneItemRequiredException ||
        e instanceof ForeignKeyViolationException
      ) {
        throw new BadRequestException(
          e.message,
          e instanceof ForeignKeyViolationException ? e.details : undefined,
        );
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Patch()
  @ApiOperation({
    summary: 'Update an existing order (Guest)',
    description: `Updates an existing order for a table session. Accessible by the
    device that originally scanned the QR code. The tableId is automatically
    extracted from the session cookie.`,
  })
  @ApiOkResponse({
    description: 'Order updated successfully',
    type: OrderDetailedResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'No valid session cookie provided',
  })
  async update(
    @Body() dto: OrderUpdateRequestDto,
    @CurrentSession() tableSession: TableSession,
  ) {
    try {
      const order = await this.updateOrderService.execute(
        tableSession.id!,
        dto,
      );
      return plainToInstance(OrderDetailedResponseDto, order, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof OrderModificationForbiddenException) {
        throw new ForbiddenException(e.message);
      }
      if (
        e instanceof OrderNotFoundException ||
        e instanceof ProductNotFoundException ||
        e instanceof AtLeastOneItemRequiredException ||
        e instanceof ForeignKeyViolationException
      ) {
        throw new BadRequestException(
          e.message,
          e instanceof ForeignKeyViolationException ? e.details : undefined,
        );
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}
