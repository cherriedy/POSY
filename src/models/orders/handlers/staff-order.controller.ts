import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../../authorization/guards/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { OrderCreateRequestDto } from '../shared/dto/order-create-request.dto';
import { OrderDetailedResponseDto } from '../shared/dto/order-detailed-response.dto';
import { OrderPreviewResponseDto } from '../shared/dto/order-preview-response.dto';
import { OrderQueryParamsDto } from '../shared/dto/order-query-params.dto';
import { OrderUpdateRequestDto } from '../shared/dto/order-update-request.dto';
import { StaffSessionContextService } from '../../table-sessions/features/start-session/staff-session-context.service';
import { JwtPayload } from '../../../authentication/interfaces/jwt-payload.interface';
import { createPageResponseSchema } from '../../../common/dto/page-response';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import {
  CreateOrderService,
  toPayload as toCreateOrderPayload,
} from '../services/create-order.service';
import { GetOrdersService } from '../services/get-orders.service';
import { UpdateOrderService } from '../services/update-order.service';
import {
  toPayload as toPayloadUpdateOrderStatus,
  UpdateOrderStatusService,
} from '../services/update-order-status.service';
import {
  toPayload as toPayloadUpdateOrderItemStatus,
  UpdateOrderItemStatusService,
} from '../services/update-order-item-status.service';
import { UpdateOrderStatusDto } from '../shared/dto/update-order-status.dto';
import { UpdateOrderItemStatusDto } from '../shared/dto/update-order-item-status.dto';

@ApiTags('Orders')
@ApiExtraModels(OrderPreviewResponseDto, OrderDetailedResponseDto)
@UseGuards(AuthGuard('jwt'), RoleGuard)
@ApiBearerAuth()
@Controller('orders')
export class StaffOrderController {
  constructor(
    private readonly createOrderService: CreateOrderService,
    private readonly getOrdersService: GetOrdersService,
    private readonly updateOrderService: UpdateOrderService,
    private readonly updateOrderStatusService: UpdateOrderStatusService,
    private readonly updateOrderItemStatusService: UpdateOrderItemStatusService,
    private readonly staffSessionContextService: StaffSessionContextService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve a paginated list of orders (Staff)',
    description: `Returns a paginated list of orders which is accessible by any authenticated staff member.`,
  })
  @ApiOkResponse({
    description: 'Paginated list of orders',
    schema: createPageResponseSchema(OrderPreviewResponseDto),
  })
  async getAll(@Query() query: OrderQueryParamsDto) {
    const orders = await this.getOrdersService.getAll(query.toQueryParams());
    const items = plainToInstance(OrderPreviewResponseDto, orders.items, {
      excludeExtraneousValues: false,
    });
    return { ...orders, items };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve order details (Staff)',
    description: `Returns detailed information about a specific order, accessible by any authenticated staff member.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({
    description: 'Order details',
    type: OrderDetailedResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid order ID' })
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    const order = await this.getOrdersService.getById(id);
    return plainToInstance(OrderDetailedResponseDto, order, {
      excludeExtraneousValues: true,
    });
  }

  @Post(':tableId')
  @ApiOperation({
    summary: 'Create a new order (Staff)',
    description: `Creates a new order for a table. Accessible by an authenticated staff member.
    The tableId is provided as a path parameter and a staff session will be resolved/created for that table.`,
  })
  @ApiParam({ name: 'tableId', type: String })
  @ApiCreatedResponse({
    description: 'Order created successfully',
    type: OrderDetailedResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request or business rule violation',
  })
  @ApiUnauthorizedResponse({ description: 'No valid JWT token provided' })
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  async create(
    @Req() req: Request,
    @Param('tableId', new ParseUUIDPipe()) tableId: string,
    @Body() dto: OrderCreateRequestDto,
  ) {
    const userId = (req.user as JwtPayload)?.sub;
    const staffTableContext =
      await this.staffSessionContextService.createSessionForOrder(
        tableId,
        userId,
      );
    const sessionId = staffTableContext.sessionId;
    console.log('CREATE SESSION:', sessionId);

    const order = await this.createOrderService.execute(
      toCreateOrderPayload(dto.items, tableId, sessionId, userId, dto.note),
    );

    return plainToInstance(OrderDetailedResponseDto, order, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':orderId/status')
  @ApiOperation({
    summary: 'Update order status (Staff)',
    description: 'Allows staff to update the overall status of an order.',
  })
  @ApiParam({ name: 'orderId', type: String })
  @ApiOkResponse({ description: 'Updated order' })
  @ApiBadRequestResponse({
    description: 'Invalid request or resource not found',
  })
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  async updateOrderStatus(
    @Req() req: Request & { user: JwtPayload },
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const { sub, role } = req.user;
    const updated = await this.updateOrderStatusService.execute(
      toPayloadUpdateOrderStatus({ sub, role }, orderId, dto),
    );
    return plainToInstance(OrderDetailedResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':tableId')
  @ApiOperation({
    summary: 'Update an order for a table (Staff)',
    description: `Updates an existing order for a table. Accessible by an authenticated staff member.
    The tableId is provided as a path parameter and a staff session will be resolved/created for that table.`,
  })
  @ApiParam({ name: 'tableId', type: String })
  @ApiOkResponse({
    description: 'Order updated successfully',
    type: OrderDetailedResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request or business rule violation',
  })
  @ApiUnauthorizedResponse({ description: 'No valid JWT token provided' })
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  async update(
    @Req() req: Request,
    @Param('tableId', new ParseUUIDPipe()) tableId: string,
    @Body() dto: OrderUpdateRequestDto,
  ) {
    const userId = (req.user as JwtPayload)?.sub;
    const staffTableContext =
      await this.staffSessionContextService.getActiveSessionForOrder(tableId);
    const sessionId = staffTableContext.sessionId;
    console.log('UPDATE SESSION:', sessionId);

    const userRole = (req.user as JwtPayload)?.role as Role;
    const order = await this.updateOrderService.execute(sessionId, dto, {
      id: userId,
      role: userRole,
    });

    return plainToInstance(OrderDetailedResponseDto, order, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':orderId/items/:itemId/status')
  @ApiOperation({})
  @ApiParam({ name: 'orderId', type: String })
  @ApiParam({ name: 'itemId', type: String })
  @ApiBody({ type: UpdateOrderItemStatusDto })
  @ApiOkResponse({ description: 'Updated order' })
  @ApiBadRequestResponse({
    description: 'Invalid request or resource not found',
  })
  @ApiForbiddenResponse({
    description: 'Modification not allowed for this item',
  })
  @ApiConflictResponse({
    description: 'Insufficient required ingredient to prepare item',
  })
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF, Role.KITCHEN)
  async updateItemStatus(
    @Req() req: Request & { user: JwtPayload },
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @Body() dto: UpdateOrderItemStatusDto,
  ) {
    const updated = await this.updateOrderItemStatusService.execute(
      toPayloadUpdateOrderItemStatus(orderId, itemId, dto, req.user),
    );
    return plainToInstance(OrderDetailedResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }
}
