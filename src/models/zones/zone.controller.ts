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
import { CreateZoneService } from './create-zone/create-zone.service';
import { UpdateZoneService } from './update-zone/update-zone.service';
import { DeleteZoneService } from './delete-zone/delete-zone.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { Role } from '../../common/enums';
import { Roles } from '../../common/decorators';
import { GetZonesService } from './get-zones/get-zones.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { plainToInstance } from 'class-transformer';
import {
  ZoneDetailedResponseDto,
  ZonePreviewResponseDto,
  ZoneQueryParamsDto,
  ZoneCreateRequestDto,
  ZoneUpdateRequestDto,
} from './dto';
import { Page } from '../../common/interfaces';
import { ZoneNotFoundException } from './exceptions';
import { Zone } from './types';
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

@ApiTags('Zone')
@ApiBearerAuth()
@Controller('zone')
export class ZoneController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(
    private readonly getZonesService: GetZonesService,
    private readonly createZoneService: CreateZoneService,
    private readonly updateZoneService: UpdateZoneService,
    private readonly deleteZoneService: DeleteZoneService,
  ) {}

  @Get(':id')
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Get zone by ID',
    description: `Fetches detailed information for a specific zone by its unique ID. Accessible
     by MANAGER and ADMIN roles.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Zone details',
    type: ZoneDetailedResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Zone not found' })
  async getZoneById(@Param('id') id: string): Promise<ZoneDetailedResponseDto> {
    const zone = await this.getZonesService.getZoneById(id);
    return plainToInstance(ZoneDetailedResponseDto, zone, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Get all zones',
    description: `Returns a paginated list of all zones. Accessible by MANAGER and ADMIN roles.`,
  })
  @ApiQuery({ name: 'query', required: false, type: ZoneQueryParamsDto })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of zones',
    schema: createPageResponseSchema(ZonePreviewResponseDto),
  })
  async getZones(
    @Query() query: ZoneQueryParamsDto,
  ): Promise<Page<ZonePreviewResponseDto>> {
    try {
      const queryParams = query.toQueryParams();
      const zonePage = await this.getZonesService.getAll(queryParams);
      const zonePreviewItems = plainToInstance(
        ZonePreviewResponseDto,
        zonePage.items,
        { excludeExtraneousValues: true },
      );
      return {
        ...zonePage,
        items: zonePreviewItems,
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
    summary: 'Create a new zone',
    description: `Creates a new zone with the provided details. Only accessible by ADMIN and MANAGER roles.`,
  })
  @ApiBody({ type: ZoneCreateRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Zone created',
    type: ZonePreviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Duplicate entry or related record not found',
  })
  async createZone(@Body() dto: ZoneCreateRequestDto) {
    try {
      const zone = await this.createZoneService.createZone(dto as Zone);
      return plainToInstance(ZonePreviewResponseDto, zone, {
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
    summary: 'Update a zone',
    description:
      'Updates an existing zone by its ID. Only accessible by ADMIN and MANAGER roles.',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: ZoneUpdateRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Zone updated',
    type: ZonePreviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Zone not found or duplicate entry',
  })
  async updateZone(@Param('id') id: string, @Body() dto: ZoneUpdateRequestDto) {
    try {
      const zone = await this.updateZoneService.updateZone(
        id,
        dto as Partial<Zone>,
      );
      return plainToInstance(ZoneDetailedResponseDto, zone, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof ZoneNotFoundException) {
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
    summary: 'Delete a zone',
    description:
      'Deletes a zone by its ID. Only accessible by ADMIN and MANAGER roles.',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Zone deleted' })
  @ApiResponse({
    status: 400,
    description: 'Zone not found or foreign key violation',
  })
  async deleteZone(@Param('id') id: string) {
    try {
      await this.deleteZoneService.deleteZone(id);
      return { message: 'Zone has been successfully deleted.' };
    } catch (e) {
      if (e instanceof ZoneNotFoundException) {
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
