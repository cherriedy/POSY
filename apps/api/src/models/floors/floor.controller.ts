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
import { CreateFloorService } from '@posy/floors/features/create-floor/create-floor.service';
import { UpdateFloorService } from '@posy/floors/features/update-floor/update-floor.service';
import { DeleteFloorService } from '@posy/floors/features/delete-floor/delete-floor.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@posy/auth';
import { Role } from '@posy/shared';
import { Roles } from '@posy/shared';
import { GetFloorsService } from '@posy/floors/features/get-floors/get-floors.service';
import { plainToInstance } from 'class-transformer';
import { FloorDetailedResponseDto } from '@posy/floors/shared/dto/floor-detailed-response.dto';
import { FloorPreviewResponseDto } from '@posy/floors/shared/dto/floor-preview-response.dto';
import { FloorQueryParamsDto } from '@posy/floors/shared/dto/floor-query-params.dto';
import { FloorCreateRequestDto } from '@posy/floors/shared/dto/floor-create-request.dto';
import { FloorUpdateRequestDto } from '@posy/floors/shared/dto/floor-update-request.dto';
import { Page } from '@posy/shared';
import { Floor } from '@posy/floors/shared/entities/floor';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { createPageResponseSchema } from '@posy/shared';

@ApiTags('Floors')
@ApiBearerAuth()
@Controller('floors')
export class FloorController {
  constructor(
    private readonly getFloorsService: GetFloorsService,
    private readonly createFloorService: CreateFloorService,
    private readonly updateFloorService: UpdateFloorService,
    private readonly deleteFloorService: DeleteFloorService,
  ) {}

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
  }

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
  @ApiResponse({ status: 404, description: 'Floor not found' })
  async getFloorById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<FloorDetailedResponseDto> {
    const floor = await this.getFloorsService.getFloorById(id);
    return plainToInstance(FloorDetailedResponseDto, floor, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
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
    const floor = await this.createFloorService.createFloor(dto as Floor);
    return plainToInstance(FloorPreviewResponseDto, floor, {
      excludeExtraneousValues: true,
    });
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
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: FloorUpdateRequestDto,
  ) {
    const floor = await this.updateFloorService.updateFloor(
      id,
      dto as Partial<Floor>,
    );
    return plainToInstance(FloorDetailedResponseDto, floor, {
      excludeExtraneousValues: true,
    });
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
  async deleteFloor(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.deleteFloorService.deleteFloor(id);
    return { message: 'Floor has been successfully deleted.' };
  }
}
