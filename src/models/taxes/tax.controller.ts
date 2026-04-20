import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { Roles } from '../../common/decorators';
import { Role } from '../../common/enums';
import {
  TaxCreateRequestDto,
  TaxDetailedResponseDto,
  TaxPreviewResponseDto,
  TaxQueryParamsDto,
  TaxUpdateRequestDto,
  TaxAssociationResponseDto,
  TaxAssociationBulkUpsertItemResponseDto,
  TaxAssociationBulkUpsertResponseDto,
  TaxAssociationBulkRemoveItemResponseDto,
  TaxAssociationBulkRemoveResponseDto,
} from './dto';
import { TaxConfig } from './entities';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { DuplicateEntryException } from '../../common/exceptions';
import { plainToInstance } from 'class-transformer';
import { GetTaxesService } from './get-taxes';
import { CreateTaxService } from './create-tax';
import { UpdateTaxService } from './update-tax';
import { DeleteTaxService } from './delete-tax';
import { AssociateEntityTaxService } from './associate-entity-tax';
import { GetEntityTaxAssociationsService } from './get-entity-tax-associations';
import {
  RemoveEntityTaxAssociationService,
  RemoveEntityTaxAssociationMapper,
} from './remove-entity-tax-association';
import { TaxNotFoundException } from './exceptions';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { createPageResponseSchema } from '../../common/dto';
import { EntityType } from './enums';
import { AssociateEntityTaxMapper } from './associate-entity-tax';
import {
  TaxAssociationBulkUpsertRequestDto,
  TaxAssociationDeleteRequestDto,
} from './dto';

@ApiTags('Taxes')
@ApiBearerAuth()
@Controller('taxes')
export class TaxController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(
    private readonly getTaxesService: GetTaxesService,
    private readonly createTaxService: CreateTaxService,
    private readonly updateTaxService: UpdateTaxService,
    private readonly deleteTaxService: DeleteTaxService,
    private readonly associateEntityTaxService: AssociateEntityTaxService,
    private readonly getEntityTaxAssociationsService: GetEntityTaxAssociationsService,
    private readonly removeEntityTaxAssociationService: RemoveEntityTaxAssociationService,
  ) {}

  // ────────────────────────────────
  // GET /taxes
  // ────────────────────────────────
  @Get()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get all taxes',
    description: `Returns a paginated list of all tax configurations. Accessible only by ADMIN.`,
  })
  @ApiQuery({ name: 'query', required: false, type: TaxQueryParamsDto })
  @ApiOkResponse({
    description: 'Paginated list of taxes',
    schema: createPageResponseSchema(TaxPreviewResponseDto),
  })
  @ApiBadRequestResponse({
    description: 'Validation failed, duplicate entry.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected failure.',
  })
  async getAll(@Query() query: TaxQueryParamsDto) {
    try {
      const taxes = await this.getTaxesService.getAll(query.toQueryParams());
      const items = plainToInstance(TaxPreviewResponseDto, taxes.items, {
        excludeExtraneousValues: true,
      });
      return { ...taxes, items };
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  // ────────────────────────────────
  // GET /taxes/active
  // ────────────────────────────────
  @Get('active')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get all active taxes',
    description: `Returns a list of all active tax configurations. Accessible by all authenticated users.`,
  })
  @ApiOkResponse({
    description: 'List of active taxes',
    type: [TaxPreviewResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Validation failed, duplicate entry.',
  })
  @ApiInternalServerErrorResponse({ description: 'Unexpected failure.' })
  async getAllActive() {
    try {
      const taxes = await this.getTaxesService.getAllActive();
      return plainToInstance(TaxPreviewResponseDto, taxes, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  // ────────────────────────────────
  // GET /taxes/:id
  // ────────────────────────────────
  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get tax by ID',
    description: `Fetches detailed information for a specific tax configuration by its unique ID. Accessible only by ADMIN.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({
    description: 'Tax details',
    type: TaxDetailedResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed, duplicate entry.',
  })
  @ApiNotFoundResponse({ description: 'Resource does not exist.' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected failure.' })
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    try {
      const tax = await this.getTaxesService.getById(id);
      return plainToInstance(TaxDetailedResponseDto, tax, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof TaxNotFoundException) {
        throw new NotFoundException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  // ────────────────────────────────
  // POST /taxes
  // ────────────────────────────────
  @Post()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Create a new tax',
    description: `Creates a new tax configuration with the provided details. Only accessible by ADMIN.`,
  })
  @ApiBody({ type: TaxCreateRequestDto })
  @ApiCreatedResponse({
    description: 'Tax created successfully',
    type: TaxPreviewResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed, duplicate entry.',
  })
  @ApiInternalServerErrorResponse({ description: 'Unexpected failure.' })
  async create(@Body() dto: TaxCreateRequestDto) {
    try {
      const tax = await this.createTaxService.create(
        dto as unknown as TaxConfig,
      );
      return plainToInstance(TaxPreviewResponseDto, tax, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof DuplicateEntryException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  // ────────────────────────────────
  // PUT /taxes/:id
  // ────────────────────────────────
  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Update a tax',
    description: `Updates an existing tax configuration by its ID. Only accessible by ADMIN.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: TaxUpdateRequestDto })
  @ApiOkResponse({ description: 'Tax updated successfully' })
  @ApiBadRequestResponse({
    description: 'Validation failed, duplicate entry.',
  })
  @ApiNotFoundResponse({ description: 'Resource does not exist.' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected failure.' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: TaxUpdateRequestDto,
  ) {
    try {
      const tax = await this.updateTaxService.update(id, dto);
      return plainToInstance(TaxPreviewResponseDto, tax, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof TaxNotFoundException) {
        throw new NotFoundException(e.message);
      } else if (e instanceof DuplicateEntryException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  // ────────────────────────────────
  // DELETE /taxes/:id
  // ────────────────────────────────
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Delete a tax',
    description: `Soft deletes a tax configuration by its ID. Only accessible by ADMIN.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Tax deleted' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Resource does not exist.' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected failure.' })
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    try {
      await this.deleteTaxService.delete(id);
      return { message: 'Tax deleted successfully.' };
    } catch (e) {
      if (e instanceof TaxNotFoundException) {
        throw new NotFoundException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  // ==================== Entity-Tax Association Endpoints ====================
  // ────────────────────────────────
  // POST /taxes/:id/entities
  // ────────────────────────────────
  @Post(':id/entities')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Bulk upsert entity-tax associations',
    description: `Creates or updates associations between a tax configuration and one or more entities. Only accessible by ADMIN.`,
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Tax configuration ID',
  })
  @ApiBody({ type: TaxAssociationBulkUpsertRequestDto })
  @ApiCreatedResponse({
    description: 'Per-item result with counts',
    type: TaxAssociationBulkUpsertResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed, duplicate entry.' })
  @ApiNotFoundResponse({ description: 'Resource does not exist.' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected failure.' })
  async upsertEntityTaxAssociations(
    @Param('id', new ParseUUIDPipe()) taxId: string,
    @Body() dto: TaxAssociationBulkUpsertRequestDto,
  ): Promise<TaxAssociationBulkUpsertResponseDto> {
    try {
      const results = await this.associateEntityTaxService.bulkUpsert(
        AssociateEntityTaxMapper.toPayload(taxId, dto),
      );

      const items = plainToInstance(
        TaxAssociationBulkUpsertItemResponseDto,
        results.map((r) => {
          const association = plainToInstance(
            TaxAssociationResponseDto,
            r.config,
            { excludeExtraneousValues: true },
          );
          if (r.entityRef && r.status === 'SUCCEED') {
            ['entityId', 'entityType'].forEach((k) => delete association[k]);
          }
          return {
            entityRef: {
              id: r.entityRef.id,
              type: r.entityRef.type,
            },
            status: r.status,
            association,
            error: r.error,
          };
        }),
        { excludeExtraneousValues: true },
      );

      return plainToInstance(
        TaxAssociationBulkUpsertResponseDto,
        {
          items,
          total: items.length,
          succeeded: items.filter((i) => i.status === 'SUCCEED').length,
          failed: items.filter((i) => i.status === 'FAILED').length,
        } as TaxAssociationBulkUpsertRequestDto,
        { excludeExtraneousValues: true },
      );
    } catch (e) {
      if (e instanceof TaxNotFoundException) {
        throw new NotFoundException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  // ────────────────────────────────
  // GET /taxes/:id/entities
  // ────────────────────────────────
  @Get(':id/entities')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get all entities associated with a tax',
    description: `Returns all entity associations for a specific tax configuration. Only accessible by ADMIN.`,
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Tax configuration ID',
  })
  @ApiOkResponse({
    description: 'List of entity associations',
    type: [TaxAssociationResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Validation failed, duplicate entry.',
  })
  @ApiNotFoundResponse({ description: 'Resource does not exist.' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected failure.' })
  async getEntitiesForTax(@Param('id', new ParseUUIDPipe()) taxId: string) {
    try {
      const associations =
        await this.getEntityTaxAssociationsService.getByTaxId(taxId);

      const items = associations.map((a) => {
        const association = plainToInstance(TaxAssociationResponseDto, a, {
          excludeExtraneousValues: true,
        });

        ['entityId', 'entityType'].forEach((k) => delete association[k]);

        return {
          entityRef: {
            id: a.entityId,
            type: a.entityType,
          },
          association,
        };
      });

      return {
        items,
        total: items.length,
      };
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  // ────────────────────────────────
  // DELETE /taxes/:id/entities
  // ────────────────────────────────
  @Delete(':id/entities')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Bulk remove entity-tax associations',
    description: `Removes one or more entity-tax associations by their IDs in a best-effort manner. Only accessible by ADMIN.`,
  })
  @ApiParam({
    name: 'id',
    type: String,
    description:
      'Tax configuration ID (used for context; associations are identified by their own IDs)',
  })
  @ApiBody({ type: TaxAssociationDeleteRequestDto })
  @ApiOkResponse({
    description: 'Per-item result with summary counts',
    type: TaxAssociationBulkRemoveResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed.' })
  @ApiNotFoundResponse({ description: 'Resource does not exist.' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected failure.' })
  async removeEntityTaxAssociations(
    @Param('id', new ParseUUIDPipe()) taxId: string,
    @Body() dto: TaxAssociationDeleteRequestDto,
  ): Promise<TaxAssociationBulkRemoveResponseDto> {
    try {
      const results = await this.removeEntityTaxAssociationService.bulkRemove(
        RemoveEntityTaxAssociationMapper.toPayload(taxId, dto),
      );
      const items = plainToInstance(
        TaxAssociationBulkRemoveItemResponseDto,
        results.map((r) => ({
          id: r.id,
          status: r.status,
          error: r.error,
        })),
        { excludeExtraneousValues: true },
      );

      return plainToInstance(
        TaxAssociationBulkRemoveResponseDto,
        {
          items,
          total: dto.associationIds.length,
          succeeded: items.filter((i) => i.status === 'SUCCEED').length,
          failed: items.filter((i) => i.status === 'FAILED').length,
        },
        { excludeExtraneousValues: true },
      );
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  // ────────────────────────────────
  // GET /taxes/entities/:type/:id
  // ────────────────────────────────
  @Get('entities/:type/:id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get all taxes associated with an entity',
    description: `Returns all tax associations for a specific entity. Only accessible by ADMIN.`,
  })
  @ApiParam({
    name: 'type',
    type: String,
    enum: EntityType,
    description: 'Entity type',
  })
  @ApiParam({ name: 'id', type: String, description: 'Entity ID' })
  @ApiOkResponse({
    description: 'List of tax associations',
    type: [TaxAssociationResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Validation failed, duplicate entry.',
  })
  @ApiNotFoundResponse({ description: 'Resource does not exist.' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected failure.' })
  async getTaxesForEntity(
    @Param('id', new ParseUUIDPipe()) entityId: string,
    @Param('type', new ParseEnumPipe(EntityType)) entityType: EntityType,
  ) {
    try {
      const associations =
        await this.getEntityTaxAssociationsService.getByEntity(
          entityType,
          entityId,
        );
      return plainToInstance(TaxAssociationResponseDto, associations, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}
