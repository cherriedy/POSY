import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
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
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { plainToInstance } from 'class-transformer';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { Roles } from '../../common/decorators';
import { Role } from '../../common/enums';
import {
  DuplicateEntryException,
  ForeignKeyViolationException,
} from '../../common/exceptions';
import {
  UnitCreateRequestDto,
  UnitQueryParamsDto,
  UnitResponseDto,
} from './dto';
import { CreateUnitService, CreateUnitPayloadMapper } from './create-unit';
import { GetUnitsService } from './get-units';
import { UpdateUnitService, UpdateUnitPayloadMapper } from './update-unit';
import { DeleteUnitService } from './delete-unit';
import { UnitNotFoundException } from './exceptions';
import { Page } from '../../common/interfaces';

@ApiTags('Units')
@ApiBearerAuth()
@Controller('units')
export class UnitController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

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
    try {
      const params = query.toQueryParams();
      const result = await this.getUnitsService.getAllPaged(params);
      return {
        ...result,
        items: plainToInstance(UnitResponseDto, result.items, {
          excludeExtraneousValues: true,
        }),
      };
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
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
    try {
      const unit = await this.getUnitsService.getById(id);
      return plainToInstance(UnitResponseDto, unit, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof UnitNotFoundException) {
        throw new NotFoundException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
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
    try {
      const payload = CreateUnitPayloadMapper.fromDto(dto);
      const unit = await this.createUnitService.create(payload);
      return plainToInstance(UnitResponseDto, unit, {
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
    try {
      const payload = UpdateUnitPayloadMapper.fromDto(dto);
      const unit = await this.updateUnitService.update(id, payload);
      return plainToInstance(UnitResponseDto, unit, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof DuplicateEntryException) {
        throw new BadRequestException(e.message);
      } else if (e instanceof UnitNotFoundException) {
        throw new NotFoundException(e.message);
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
  @ApiOperation({ summary: 'Delete a unit' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Unit deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Unit not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    try {
      await this.deleteUnitService.delete(id);
      return { message: 'Unit deleted successfully.' };
    } catch (e) {
      if (e instanceof UnitNotFoundException) {
        throw new NotFoundException(e.message);
      } else if (e instanceof ForeignKeyViolationException) {
        throw new ConflictException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}
