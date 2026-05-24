import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
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
import { OrderCreateRequestDto } from '@posy/orders/dto/order-create-request.dto';
import { OrderDetailedResponseDto } from '@posy/orders/dto/order-detailed-response.dto';
import { OrderPreviewResponseDto } from '@posy/orders/dto/order-preview-response.dto';
import { OrderUpdateRequestDto } from '@posy/orders/dto/order-update-request.dto';
import { CurrentSession } from '../../table-sessions/shared/decorators/current-session.decorator';
import { TableSession } from '../../table-sessions/shared/entities/table-session';
import { TableSessionGuard } from '../../table-sessions/shared/guards/table-session.guard';
import { toPayload as toCreateOrderPayload } from '../services/create-order.service';
import { UpdateOrderService } from '../services/update-order.service';
import { OrderFacadeService } from '../services/order-facade.service';

@ApiTags('Orders (Guest)')
@ApiExtraModels(OrderPreviewResponseDto, OrderDetailedResponseDto)
@UseGuards(TableSessionGuard)
@ApiCookieAuth('session_token')
@Controller('guest/orders')
export class GuestOrderController {
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
    const { id: sessionId } = tableSession;
    return await this.orderFacadeService.getOrderWithRecommendations(
      sessionId!,
    );
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
    const { tableId, id: sessionId } = tableSession;
    return await this.orderFacadeService.createOrderWithRecommendations(
      toCreateOrderPayload(dto.items, tableId, sessionId!, null, dto.note),
    );
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
    const order = await this.updateOrderService.execute(
      tableSession.id!,
      dto,
    );
    return plainToInstance(OrderDetailedResponseDto, order, {
      excludeExtraneousValues: true,
    });
  }
}
