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
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { RoleGuard } from '@posy/auth';
import { Roles } from '@posy/shared';
import { Role } from '@posy/shared';
import { UnitCreateRequestDto } from './dto/unit-create-request.dto';
import { UnitQueryParamsDto } from './dto/unit-query-params.dto';
import { UnitResponseDto } from './dto/unit-response.dto';
import { CreateUnitService } from '@posy/units/features/create-unit/create-unit.service';
import { CreateUnitPayloadMapper } from '@posy/units/features/create-unit/create-unit-payload.mapper';
import { GetUnitsService } from '@posy/units/features/get-units/get-units.service';
import { UpdateUnitService } from '@posy/units/features/update-unit/update-unit.service';
import { UpdateUnitPayloadMapper } from '@posy/units/features/update-unit/update-unit-payload.mapper';
import { DeleteUnitService } from '@posy/units/features/delete-unit/delete-unit.service';
import { Page } from '@posy/shared';

@ApiTags('Units')
@ApiBearerAuth()
@Controller('units')
export class UnitController {
  constructor(
    private readonly createUnitService: CreateUnitService,
    private readonly getUnitsService: GetUnitsService,
    private readonly updateUnitService: UpdateUnitService,
    private readonly deleteUnitService: DeleteUnitService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Get all units (paginated)' })
  @ApiResponse({
    status: 200,
    description: 'Units retrieved successfully.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getAll(
    @Query() query: UnitQueryParamsDto,
  ): Promise<Page<UnitResponseDto>> {
    const params = query.toQueryParams();
    const result = await this.getUnitsService.getAllPaged(params);
    return {
      ...result,
      items: plainToInstance(UnitResponseDto, result.items, {
        excludeExtraneousValues: true,
      }),
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Get unit by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    type: UnitResponseDto,
    description: 'Unit retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Unit not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<UnitResponseDto> {
    const unit = await this.getUnitsService.getById(id);
    return plainToInstance(UnitResponseDto, unit, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a unit' })
  @ApiBody({ type: UnitCreateRequestDto })
  @ApiResponse({
    status: 201,
    type: UnitResponseDto,
    description: 'Unit created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Duplicate name or abbreviation.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async create(@Body() dto: UnitCreateRequestDto): Promise<UnitResponseDto> {
    const payload = CreateUnitPayloadMapper.fromDto(dto);
    const unit = await this.createUnitService.create(payload);
    return plainToInstance(UnitResponseDto, unit, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Update a unit' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UnitCreateRequestDto })
  @ApiResponse({
    status: 200,
    type: UnitResponseDto,
    description: 'Unit updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Unit not found or duplicate name/abbreviation.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UnitCreateRequestDto,
  ): Promise<UnitResponseDto> {
    const payload = UpdateUnitPayloadMapper.fromDto(dto);
    const unit = await this.updateUnitService.update(id, payload);
    return plainToInstance(UnitResponseDto, unit, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a unit' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Unit deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Unit not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    await this.deleteUnitService.delete(id);
    return { message: 'Unit deleted successfully.' };
  }
}
