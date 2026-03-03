import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { CreateOrderService } from './create-order/create-order.service';
import { GetOrdersService } from './get-orders/get-orders.service';
import { SessionOrJwtGuard } from './guards';
import {
  OrderCreateRequestDto,
  OrderQueryParamsDto,
  OrderPreviewResponseDto,
  OrderDetailedResponseDto,
} from './dto';
import { OrderNotFoundException } from './exceptions';
import { CurrentSession } from '../table-sessions/decorators';
import { TableSession } from '../table-sessions/types';
import { JwtPayload } from '../../authentication/interfaces';
import { Roles } from '../../common/decorators';
import { Role } from '../../common/enums';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { createPageResponseSchema } from '../../common/dto';
import {
  AtLeastOneItemRequiredException,
  DuplicateEntryException,
  ForeignKeyViolationException,
} from '../../common/exceptions';
import { ProductNotFoundException } from '../products/exceptions';
import { TableNotFoundException } from '../tables/exceptions';

@ApiTags('Orders')
@ApiExtraModels(OrderPreviewResponseDto, OrderDetailedResponseDto)
@Controller('order')
export class OrderController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(
    private readonly createOrderService: CreateOrderService,
    private readonly getOrdersService: GetOrdersService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF, Role.KITCHEN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all orders',
    description: `Returns a paginated list of orders. Accessible by all staff roles.
    Supports filtering by session, table, creator and status.`,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of orders',
    schema: createPageResponseSchema(OrderPreviewResponseDto),
  })
  async getAll(@Query() query: OrderQueryParamsDto) {
    try {
      const orders = await this.getOrdersService.getAll(query.toQueryParams());
      const items = plainToInstance(OrderPreviewResponseDto, orders.items, {
        excludeExtraneousValues: true,
      });
      return { ...orders, items };
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Get(':id')
  @UseGuards(SessionOrJwtGuard)
  @ApiBearerAuth()
  @ApiCookieAuth('session_token')
  @ApiOperation({
    summary: 'Get order by ID',
    description: `Returns a single order. Accessible by the QR-scanned device session
    or any authenticated staff member.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Order details',
    type: OrderDetailedResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getById(@Param('id') id: string) {
    try {
      const order = await this.getOrdersService.getById(id);
      return plainToInstance(OrderDetailedResponseDto, order, {
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

  @Post()
  @UseGuards(SessionOrJwtGuard)
  @ApiBearerAuth()
  @ApiCookieAuth('session_token')
  @ApiOperation({
    summary: 'Create a new order',
    description: `Creates a new order for a table session. Accessible by the device
    that originally scanned the QR code OR by an authenticated staff member.
    The tableId and sessionId are automatically extracted from the session cookie.
    The creator is determined from the JWT token (staff) or session (guest).`,
  })
  @ApiResponse({
    status: 201,
    description: 'Order created',
    type: OrderDetailedResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or foreign key violation',
  })
  async create(
    @Body() dto: OrderCreateRequestDto,
    @Req() req: Request,
    @CurrentSession() tableSession: TableSession,
  ) {
    try {
      // Extract tableId and sessionId from session cookie
      const tableId = tableSession.tableId;
      const sessionId = tableSession.id!;

      // Determine the creator of the order:
      // - If staff, extract user ID from JWT payload
      // - If guest, use the table session's createdBy
      const jwtUser = req.user as JwtPayload | undefined;
      const createdBy = jwtUser?.sub ?? tableSession.createdBy ?? null;

      const order = await this.createOrderService.create(
        dto.items,
        tableId,
        sessionId,
        createdBy,
        dto.note,
      );
      return plainToInstance(OrderDetailedResponseDto, order, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (
        e instanceof DuplicateEntryException ||
        e instanceof ProductNotFoundException ||
        e instanceof TableNotFoundException ||
        e instanceof AtLeastOneItemRequiredException
      ) {
        throw new BadRequestException(e.message);
      }
      if (e instanceof ForeignKeyViolationException) {
        throw new BadRequestException({
          message: e.message,
          details: e.details,
        });
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}
