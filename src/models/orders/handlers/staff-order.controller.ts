import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  InternalServerErrorException,
  LoggerService,
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
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  InsufficientRequiredIngredientException,
  OrderCreateRequestDto,
  OrderDetailedResponseDto,
  OrderModificationForbiddenException,
  OrderNotFoundException,
  OrderPreviewResponseDto,
  OrderQueryParamsDto,
  OrderUpdateRequestDto,
} from '../shared';
import { StaffSessionContextService } from '../../table-sessions';
import { JwtPayload } from '../../../authentication/interfaces';
import { createPageResponseSchema } from '../../../common/dto';
import { Roles } from '../../../common/decorators';
import { Role } from '../../../common/enums';
import {
  AtLeastOneItemRequiredException,
  DuplicateEntryException,
  ForeignKeyViolationException,
} from '../../../common/exceptions';
import { ProductNotFoundException } from '../../products';
import { TableNotFoundException } from '../../tables/exceptions';
import { UpdateOrderStatusDto } from '../shared/dto/update-order-status.dto';
import { UpdateOrderItemStatusDto } from '../shared/dto/update-order-item-status.dto';
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

@ApiTags('Orders')
@ApiExtraModels(OrderPreviewResponseDto, OrderDetailedResponseDto)
@UseGuards(AuthGuard('jwt'), RoleGuard)
@ApiBearerAuth()
@Controller('orders')
export class StaffOrderController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;

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
    try {
      const orders = await this.getOrdersService.getAll(query.toQueryParams());
      const items = plainToInstance(OrderPreviewResponseDto, orders.items, {
        excludeExtraneousValues: false,
      });
      return { ...orders, items };
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
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
    try {
      const staffTableContext = await this.staffSessionContextService.execute(
        tableId,
        userId,
      );
      const sessionId = staffTableContext.sessionId;

      const { order } = await this.createOrderService.execute(
        toCreateOrderPayload(dto.items, tableId, sessionId, userId, dto.note),
      );

      return plainToInstance(OrderDetailedResponseDto, order, {
        excludeExtraneousValues: true,
      });
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
    try {
      const updated = await this.updateOrderStatusService.execute(
        toPayloadUpdateOrderStatus({ sub, role }, orderId, dto),
      );
      return plainToInstance(OrderDetailedResponseDto, updated, {
        excludeExtraneousValues: true,
      });
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
    try {
      const staffTableContext = await this.staffSessionContextService.execute(
        tableId,
        userId,
      );
      const sessionId = staffTableContext.sessionId;

      const userRole = (req.user as JwtPayload)?.role as Role;
      const order = await this.updateOrderService.execute(sessionId, dto, {
        id: userId,
        role: userRole,
      });
      return plainToInstance(OrderDetailedResponseDto, order, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof OrderModificationForbiddenException) {
        throw new ForbiddenException(e.message);
      } else if (
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
    try {
      const updated = await this.updateOrderItemStatusService.execute(
        toPayloadUpdateOrderItemStatus(orderId, itemId, dto, req.user),
      );
      return plainToInstance(OrderDetailedResponseDto, updated, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (
        e instanceof AtLeastOneItemRequiredException ||
        e instanceof ProductNotFoundException ||
        e instanceof TableNotFoundException
      ) {
        throw new BadRequestException(e.message);
      } else if (e instanceof OrderModificationForbiddenException) {
        throw new ForbiddenException(e.message);
      } else if (e instanceof InsufficientRequiredIngredientException) {
        throw new ConflictException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}
