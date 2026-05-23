import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
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
import { Role } from '../../common/enums/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetZonesService } from './get-zones/get-zones.service';
import { plainToInstance } from 'class-transformer';
import { ZoneDetailedResponseDto } from './dto/zone-detailed-response.dto';
import { ZonePreviewResponseDto } from './dto/zone-preview-response.dto';
import { ZoneQueryParamsDto } from './dto/zone-query-params.dto';
import { ZoneCreateRequestDto } from './dto/zone-create-request.dto';
import { ZoneUpdateRequestDto } from './dto/zone-update-request.dto';
import { Page } from '../../common/interfaces/page.interface';
import { Zone } from './types/zone';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { createPageResponseSchema } from '../../common/dto/page-response';

@ApiTags('Zones')
@ApiBearerAuth()
@Controller('zones')
export class ZoneController {
  constructor(
    private readonly getZonesService: GetZonesService,
    private readonly createZoneService: CreateZoneService,
    private readonly updateZoneService: UpdateZoneService,
    private readonly deleteZoneService: DeleteZoneService,
  ) {}

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
  }

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
  async getZoneById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ZoneDetailedResponseDto> {
    const zone = await this.getZonesService.getZoneById(id);
    return plainToInstance(ZoneDetailedResponseDto, zone, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
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
    const zone = new Zone(
      null,
      dto.name,
      dto.description ?? null,
      dto.isActive ?? true,
      dto.floorId,
      null,
      null,
    );

    const created = await this.createZoneService.createZone(zone);
    return plainToInstance(ZonePreviewResponseDto, created, {
      excludeExtraneousValues: true,
    });
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
  async updateZone(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ZoneUpdateRequestDto,
  ) {
    const zone = await this.updateZoneService.updateZone(
      id,
      dto as Partial<Zone>,
    );
    return plainToInstance(ZoneDetailedResponseDto, zone, {
      excludeExtraneousValues: true,
    });
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
  async deleteZone(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.deleteZoneService.deleteZone(id);
    return { message: 'Zone has been successfully deleted.' };
  }
}
