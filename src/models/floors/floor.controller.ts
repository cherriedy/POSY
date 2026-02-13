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
import { CreateFloorService } from './create-floor/create-floor.service';
import { UpdateFloorService } from './update-floor/update-floor.service';
import { DeleteFloorService } from './delete-floor/delete-floor.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { Role } from '../../common/enums';
import { Roles } from '../../common/decorators';
import { GetFloorsService } from './get-floors/get-floors.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { plainToInstance } from 'class-transformer';
import {
  FloorDetailedResponseDto,
  FloorPreviewResponseDto,
  FloorQueryParamsDto,
  FloorCreateRequestDto,
  FloorUpdateRequestDto,
} from './dto';
import { Page } from '../../common/interfaces';
import { FloorNotFoundException } from './exceptions';
import { Floor } from './types';
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

@ApiTags('Floor')
@ApiBearerAuth()
@Controller('floor')
export class FloorController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(
    private readonly getFloorsService: GetFloorsService,
    private readonly createFloorService: CreateFloorService,
    private readonly updateFloorService: UpdateFloorService,
    private readonly deleteFloorService: DeleteFloorService,
  ) {}

  @Get(':id')
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Get floor by ID',
    description: `Fetches detailed information for a specific floor by its unique ID. Accessible
     by MANAGER and ADMIN roles.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Floor details',
    type: FloorDetailedResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Floor not found' })
  async getFloorById(
    @Param('id') id: string,
  ): Promise<FloorDetailedResponseDto> {
    const floor = await this.getFloorsService.getFloorById(id);
    return plainToInstance(FloorDetailedResponseDto, floor, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Get all floors',
    description: `Returns a paginated list of all floors. Accessible by MANAGER and ADMIN roles.`,
  })
  @ApiQuery({ name: 'query', required: false, type: FloorQueryParamsDto })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of floors',
    schema: createPageResponseSchema(FloorPreviewResponseDto),
  })
  async getFloors(
    @Query() query: FloorQueryParamsDto,
  ): Promise<Page<FloorPreviewResponseDto>> {
    try {
      const queryParams = query.toQueryParams();
      const floorPage = await this.getFloorsService.getAll(queryParams);
      const floorPreviewItems = plainToInstance(
        FloorPreviewResponseDto,
        floorPage.items,
        { excludeExtraneousValues: true },
      );
      return {
        ...floorPage,
        items: floorPreviewItems,
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
    summary: 'Create a new floor',
    description: `Creates a new floor with the provided details. Only accessible by ADMIN and MANAGER roles.`,
  })
  @ApiBody({ type: FloorCreateRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Floor created',
    type: FloorPreviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Duplicate entry or related record not found',
  })
  async createFloor(@Body() dto: FloorCreateRequestDto) {
    try {
      const floor = await this.createFloorService.createFloor(dto as Floor);
      return plainToInstance(FloorPreviewResponseDto, floor, {
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
    summary: 'Update a floor',
    description:
      'Updates an existing floor by its ID. Only accessible by ADMIN and MANAGER roles.',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: FloorUpdateRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Floor updated',
    type: FloorPreviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Floor not found or duplicate entry',
  })
  async updateFloor(
    @Param('id') id: string,
    @Body() dto: FloorUpdateRequestDto,
  ) {
    try {
      const floor = await this.updateFloorService.updateFloor(
        id,
        dto as Partial<Floor>,
      );
      return plainToInstance(FloorDetailedResponseDto, floor, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof FloorNotFoundException) {
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
    summary: 'Delete a floor',
    description:
      'Deletes a floor by its ID. Only accessible by ADMIN and MANAGER roles.',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Floor deleted' })
  @ApiResponse({
    status: 400,
    description: 'Floor not found or foreign key violation',
  })
  async deleteFloor(@Param('id') id: string) {
    try {
      await this.deleteFloorService.deleteFloor(id);
      return { message: 'Floor has been successfully deleted.' };
    } catch (e) {
      if (e instanceof FloorNotFoundException) {
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
