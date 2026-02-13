import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateTableService } from './create-table/create-table.service';
import { UpdateTableService } from './update-table/update-table.service';
import { DeleteTableService } from './delete-table/delete-table.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { Role } from '../../common/enums';
import { Roles } from '../../common/decorators';
import { GetTablesService } from './get-tables/get-tables.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { plainToInstance } from 'class-transformer';
import {
  TableDetailedResponseDto,
  TablePreviewResponseDto,
  TableQueryParamsDto,
  TableCreateRequestDto,
  TableUpdateRequestDto,
} from './dto';
import { Page } from '../../common/interfaces';
import { TableNotFoundException } from './exceptions';
import { Table } from './types';
import {
  DuplicateEntryException,
  ForeignKeyViolationException,
  RelatedRecordNotFoundException,
} from '../../common/exceptions';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { createPageResponseSchema } from '../../common/dto';

@ApiTags('Table')
@ApiBearerAuth()
@Controller('table')
export class TableController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(
    private readonly getTablesService: GetTablesService,
    private readonly createTableService: CreateTableService,
    private readonly updateTableService: UpdateTableService,
    private readonly deleteTableService: DeleteTableService,
  ) {}

  @Get(':id')
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Get table by ID',
    description: `Fetches detailed information for a specific table by its unique ID. Accessible
     by MANAGER and ADMIN roles.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Table details',
    type: TableDetailedResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Table not found' })
  async getTableById(
    @Param('id') id: string,
  ): Promise<TableDetailedResponseDto> {
    const table = await this.getTablesService.getTableById(id);
    return plainToInstance(TableDetailedResponseDto, table, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Get all tables',
    description: `Returns a paginated list of all tables. Accessible by MANAGER and ADMIN roles.`,
  })
  @ApiQuery({ name: 'query', required: false, type: TableQueryParamsDto })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of tables',
    schema: createPageResponseSchema(TablePreviewResponseDto),
  })
  async getTables(
    @Query() query: TableQueryParamsDto,
  ): Promise<Page<TablePreviewResponseDto>> {
    try {
      const queryParams = query.toQueryParams();
      const tablePage = await this.getTablesService.getAll(queryParams);
      const tablePreviewItems = plainToInstance(
        TablePreviewResponseDto,
        tablePage.items,
        { excludeExtraneousValues: true },
      );
      return {
        ...tablePage,
        items: tablePreviewItems,
      };
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post('')
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Create a new table',
    description: `Creates a new table with the provided details. Only accessible by ADMIN and MANAGER roles.`,
  })
  @ApiBody({ type: TableCreateRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Table created',
    type: TablePreviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Duplicate entry or related record not found',
  })
  async createTable(@Body() dto: TableCreateRequestDto) {
    try {
      const table = await this.createTableService.createTable(dto as Table);
      return plainToInstance(TablePreviewResponseDto, table, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof DuplicateEntryException) {
        throw new BadRequestException(e.message);
      } else if (e instanceof RelatedRecordNotFoundException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Update a table',
    description:
      'Updates an existing table by its ID. Only accessible by ADMIN and MANAGER roles.',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: TableUpdateRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Table updated',
    type: TablePreviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Table not found or duplicate entry',
  })
  async updateTable(
    @Param('id') id: string,
    @Body() dto: TableUpdateRequestDto,
  ) {
    try {
      const table = await this.updateTableService.updateTable(
        id,
        dto as Partial<Table>,
      );
      return plainToInstance(TableDetailedResponseDto, table, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof TableNotFoundException) {
        throw new BadRequestException(e.message);
      } else if (e instanceof DuplicateEntryException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Delete a table',
    description:
      'Deletes a table by its ID. Only accessible by ADMIN and MANAGER roles.',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Table deleted' })
  @ApiResponse({
    status: 400,
    description: 'Table not found or foreign key violation',
  })
  async deleteTable(@Param('id') id: string) {
    try {
      await this.deleteTableService.deleteTable(id);
      return { message: 'Table has been successfully deleted.' };
    } catch (e) {
      if (e instanceof TableNotFoundException) {
        throw new BadRequestException(e.message);
      } else if (e instanceof ForeignKeyViolationException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}
