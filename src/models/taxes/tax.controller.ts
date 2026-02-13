import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
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
  CreateTaxDto,
  TaxDetailedResponseDto,
  TaxPreviewResponseDto,
  TaxQueryParamsDto,
  UpdateTaxDto,
  TaxAssociationCreateRequestDto,
  TaxAssociationUpdateRequestDto,
  TaxAssociationRemoveRequestDto,
  TaxAssociationDetailedResponseDto,
  TaxBulkOperationFailureDto,
} from './dto';
import { TaxConfig } from './types';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { DuplicateEntryException } from '../../common/exceptions';
import { plainToInstance } from 'class-transformer';
import { GetTaxesService } from './get-taxes/get-taxes.service';
import { CreateTaxService } from './create-tax/create-tax.service';
import { UpdateTaxService } from './update-tax/update-tax.service';
import { DeleteTaxService } from './delete-tax/delete-tax.service';
import { AssociateEntityTaxService } from './associate-entity-tax/associate-entity-tax.service';
import { GetEntityTaxAssociationsService } from './get-entity-tax-associations/get-entity-tax-associations.service';
import { UpdateEntityTaxAssociationService } from './update-entity-tax-association/update-entity-tax-association.service';
import { RemoveEntityTaxAssociationService } from './remove-entity-tax-association/remove-entity-tax-association.service';
import { TaxNotFoundException } from './exceptions';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import {
  BulkOperationResponseDto,
  createPageResponseSchema,
} from '../../common/dto';
import { EntityType } from './enums';

@ApiTags('Tax')
@ApiBearerAuth()
@Controller('tax')
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
    private readonly updateEntityTaxAssociationService: UpdateEntityTaxAssociationService,
    private readonly removeEntityTaxAssociationService: RemoveEntityTaxAssociationService,
  ) {}

  @Get('')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Get all taxes',
    description: `Returns a paginated list of all tax configurations. Accessible only 
    by ADMIN and MANAGER roles. Supports filtering by query parameters such as type, 
    rate type, active status, etc.`,
  })
  @ApiQuery({ name: 'query', required: false, type: TaxQueryParamsDto })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of taxes',
    schema: createPageResponseSchema(TaxPreviewResponseDto),
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

  @Get('active')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get all active taxes',
    description: `Returns a list of all active tax configurations. Accessible by all 
    authenticated users. Used for calculating taxes on orders.`,
  })
  @ApiResponse({
    status: 200,
    description: 'List of active taxes',
    type: [TaxPreviewResponseDto],
  })
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

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Get tax by ID',
    description: `Fetches detailed information for a specific tax configuration by its unique ID.
    Accessible only by ADMIN and MANAGER roles. Returns 400 if the tax is not found.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Tax details',
    type: TaxDetailedResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Tax not found' })
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    try {
      const tax = await this.getTaxesService.getById(id);
      return plainToInstance(TaxDetailedResponseDto, tax, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof TaxNotFoundException) {
        throw new BadRequestException(e.message);
      } else if (e instanceof BadRequestException) {
        throw e;
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post('')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Create a new tax',
    description: `Creates a new tax configuration with the provided details. Only accessible 
    by ADMIN and MANAGER roles. Returns the created tax preview. Throws 400 for duplicate entries.`,
  })
  @ApiBody({ type: CreateTaxDto })
  @ApiResponse({
    status: 201,
    description: 'Tax created',
    type: TaxPreviewResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Duplicate entry' })
  async create(@Body() dto: CreateTaxDto) {
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
      } else if (e instanceof BadRequestException) {
        throw e;
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Update a tax',
    description: `Updates an existing tax configuration by its ID. Only accessible 
    by ADMIN and MANAGER roles. Returns the updated tax preview. Throws 400 for 
    not found or duplicate entries.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateTaxDto })
  @ApiResponse({
    status: 200,
    description: 'Tax updated',
    type: TaxPreviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Tax not found or duplicate entry',
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTaxDto,
  ) {
    try {
      const tax = await this.updateTaxService.update(id, dto);
      return plainToInstance(TaxPreviewResponseDto, tax, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof TaxNotFoundException) {
        throw new BadRequestException(e.message);
      } else if (e instanceof DuplicateEntryException) {
        throw new BadRequestException(e.message);
      } else if (e instanceof BadRequestException) {
        throw e;
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Delete a tax',
    description: `Soft deletes a tax configuration by its ID. Only accessible by 
    ADMIN. Returns a success message. Throws 400 if the tax is not found.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Tax deleted' })
  @ApiResponse({ status: 400, description: 'Tax not found' })
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    try {
      await this.deleteTaxService.delete(id);
      return { message: 'Tax deleted successfully.' };
    } catch (e) {
      if (e instanceof TaxNotFoundException) {
        throw new BadRequestException(e.message);
      } else if (e instanceof BadRequestException) {
        throw e;
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  // ==================== Entity-Tax Association Endpoints ====================

  @Post(':taxId/entity')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Associate a tax with entities (supports bulk)',
    description: `Creates associations between a tax configuration and one or more entities 
    (Product, Category, or Zone). Supports 1-100 entities per request. Only accessible by ADMIN and MANAGER roles. 
    Validates that the tax exists and the combinations are valid. Uses transactions for atomicity.`,
  })
  @ApiParam({
    name: 'taxId',
    type: String,
    description: 'Tax configuration ID',
  })
  @ApiBody({ type: TaxAssociationCreateRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Associations created successfully',
    type: BulkOperationResponseDto<TaxBulkOperationFailureDto>,
  })
  @ApiResponse({
    status: 400,
    description: 'Tax not found, duplicate association, or invalid combination',
  })
  async associateEntityTax(
    @Param('taxId', new ParseUUIDPipe()) taxId: string,
    @Body() dto: TaxAssociationCreateRequestDto,
  ) {
    try {
      const result = await this.associateEntityTaxService.associateBulk(
        taxId,
        dto.entities,
      );

      const failures = plainToInstance(
        TaxBulkOperationFailureDto,
        result.failures,
        {
          excludeExtraneousValues: true,
        },
      );

      return {
        successCount: result.successes.length,
        failedCount: result.failures.length,
        totalCount: dto.entities.length,
        failures,
        message: `Successfully created ${result.successes.length} association(s)${result.failures.length > 0 ? `, ${result.failures.length} failed` : ''}`,
      };
    } catch (e) {
      if (e instanceof TaxNotFoundException) {
        throw new BadRequestException(e.message);
      } else if (e instanceof BadRequestException) {
        throw e;
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Get(':taxId/entities')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Get all entities associated with a tax',
    description: `Returns all entity associations for a specific tax configuration. 
    Only accessible by ADMIN and MANAGER roles.`,
  })
  @ApiParam({
    name: 'taxId',
    type: String,
    description: 'Tax configuration ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of entity associations',
    type: [TaxAssociationDetailedResponseDto],
  })
  async getEntitiesForTax(@Param('taxId', new ParseUUIDPipe()) taxId: string) {
    try {
      const associations =
        await this.getEntityTaxAssociationsService.getByTaxId(taxId);
      return plainToInstance(TaxAssociationDetailedResponseDto, associations, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Get('entity/:entityType/:entityId')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Get all taxes associated with an entity',
    description: `Returns all tax associations for a specific entity. Only accessible by ADMIN and MANAGER roles.`,
  })
  @ApiParam({
    name: 'entityType',
    type: String,
    enum: EntityType,
    description: 'Entity type',
  })
  @ApiParam({ name: 'entityId', type: String, description: 'Entity ID' })
  @ApiResponse({
    status: 200,
    description: 'List of tax associations',
    type: [TaxAssociationDetailedResponseDto],
  })
  async getTaxesForEntity(
    @Param('entityId', new ParseUUIDPipe()) entityId: string,
    @Param('entityType', new ParseEnumPipe(EntityType)) entityType: EntityType,
  ) {
    try {
      const associations =
        await this.getEntityTaxAssociationsService.getByEntity(
          entityType,
          entityId,
        );
      return plainToInstance(TaxAssociationDetailedResponseDto, associations, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Put('association')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Update entity-tax associations (supports bulk)',
    description: `Updates one or more entity-tax associations. Each association can 
    have its own isActive and note values. Supports 1-100 associations per request. 
    Only accessible by ADMIN and MANAGER roles.`,
  })
  @ApiBody({ type: TaxAssociationUpdateRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Associations updated successfully',
    type: BulkOperationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Association(s) not found' })
  async updateEntityTaxAssociation(
    @Body() dto: TaxAssociationUpdateRequestDto,
  ) {
    try {
      const result = await this.updateEntityTaxAssociationService.bulkUpdate(
        dto.items,
      );

      const failures = plainToInstance(
        TaxBulkOperationFailureDto,
        result.failures,
        {
          excludeExtraneousValues: true,
        },
      );

      return {
        successCount: result.successCount,
        failedCount: result.failures.length,
        totalCount: dto.items.length,
        failures,
        message: `Successfully updated ${result.successCount} association(s)${result.failures.length > 0 ? `, ${result.failures.length} failed` : ''}`,
      } as BulkOperationResponseDto;
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e;
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Delete('association')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Remove entity-tax associations (supports bulk)',
    description: `Deletes one or more entity-tax associations by their IDs. 
    Supports 1-100 associations per request. Only accessible by ADMIN and MANAGER roles.`,
  })
  @ApiBody({ type: TaxAssociationRemoveRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Associations removed successfully',
    type: BulkOperationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Association(s) not found' })
  async removeEntityTaxAssociation(
    @Body() dto: TaxAssociationRemoveRequestDto,
  ) {
    try {
      const result = await this.removeEntityTaxAssociationService.bulkRemove(
        dto.associationIds,
      );

      const failures = plainToInstance(
        TaxBulkOperationFailureDto,
        result.failures,
        {
          excludeExtraneousValues: true,
        },
      );

      return {
        successCount: result.successCount,
        failedCount: result.failures.length,
        totalCount: dto.associationIds.length,
        failures,
        message: `Successfully removed ${result.successCount} association(s)
        ${result.failures.length > 0 ? `, ${result.failures.length} failed` : ''}`,
      };
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e;
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}
