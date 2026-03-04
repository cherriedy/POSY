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
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { Role } from '../../common/enums';
import { Roles } from '../../common/decorators';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { plainToInstance } from 'class-transformer';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';
import { createPageResponseSchema } from '../../common/dto';
import {
  CuisineCreateRequestDto,
  CuisineUpdateRequestDto,
  CuisineResponseDto,
  CuisineQueryParamsDto,
} from './dto';
import { GetCuisinesService } from './get-cuisines/get-cuisines.service';
import { CreateCuisineService } from './create-cuisine/create-cuisine.service';
import { UpdateCuisineService } from './update-cuisine/update-cuisine.service';
import { DeleteCuisineService } from './delete-cuisine/delete-cuisine.service';
import { CuisineNotFoundException } from './exceptions';
import {
  DuplicateEntryException,
  ForeignKeyViolationException,
} from '../../common/exceptions';

@ApiTags('Cuisines')
@ApiBearerAuth()
@ApiExtraModels(CuisineResponseDto)
@Controller('cuisines')
export class CuisineController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(
    private readonly getCuisinesService: GetCuisinesService,
    private readonly createCuisineService: CreateCuisineService,
    private readonly updateCuisineService: UpdateCuisineService,
    private readonly deleteCuisineService: DeleteCuisineService,
  ) { }

  @Get(':id')
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Get cuisine by ID',
    description:
      'Fetches detailed information for a specific cuisine by its unique ID.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Cuisine ID' })
  @ApiResponse({
    status: 200,
    description: 'Cuisine details',
    type: CuisineResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Cuisine not found' })
  async getCuisineById(@Param('id') id: string): Promise<CuisineResponseDto> {
    try {
      const cuisine = await this.getCuisinesService.getById(id);
      return plainToInstance(CuisineResponseDto, cuisine, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof CuisineNotFoundException) {
        throw new NotFoundException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Get()
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Get all cuisines',
    description:
      'Returns a paginated list of all cuisines with optional search filtering.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of cuisines',
    schema: createPageResponseSchema(CuisineResponseDto),
  })
  async getAllCuisines(@Query() query: CuisineQueryParamsDto): Promise<any> {
    try {
      const cuisines = await this.getCuisinesService.getAll(
        query.toQueryParams(),
      );
      const items = plainToInstance(CuisineResponseDto, cuisines.items, {
        excludeExtraneousValues: true,
      });
      return { ...cuisines, items };
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post()
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Create a new cuisine',
    description: 'Creates a new cuisine with the provided details.',
  })
  @ApiBody({ type: CuisineCreateRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Cuisine created successfully',
    type: CuisineResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Duplicate cuisine name' })
  async createCuisine(
    @Body() dto: CuisineCreateRequestDto,
  ): Promise<CuisineResponseDto> {
    try {
      const cuisine = await this.createCuisineService.create(dto);
      return plainToInstance(CuisineResponseDto, cuisine, {
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
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Update a cuisine',
    description: 'Updates an existing cuisine with the provided details.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Cuisine ID' })
  @ApiBody({ type: CuisineUpdateRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Cuisine updated successfully',
    type: CuisineResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cuisine not found or duplicate name',
  })
  async updateCuisine(
    @Param('id') id: string,
    @Body() dto: CuisineUpdateRequestDto,
  ): Promise<CuisineResponseDto> {
    try {
      const cuisine = await this.updateCuisineService.update(id, dto);
      return plainToInstance(CuisineResponseDto, cuisine, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof CuisineNotFoundException) {
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

  @Delete(':id')
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Soft-delete a cuisine',
    description:
      'Soft-deletes a cuisine by marking it as deleted. The record remains in the database but is excluded from queries.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Cuisine ID' })
  @ApiResponse({
    status: 200,
    description: 'Cuisine deleted successfully',
  })
  @ApiResponse({ status: 400, description: 'Cuisine not found' })
  async deleteCuisine(@Param('id') id: string): Promise<{ message: string }> {
    try {
      await this.deleteCuisineService.delete(id);
      return { message: 'Cuisine deleted successfully' };
    } catch (e) {
      if (e instanceof CuisineNotFoundException) {
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
}
