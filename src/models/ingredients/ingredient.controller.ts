import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { Roles } from '../../common/decorators';
import { Role } from '../../common/enums';
import {
  IngredientCreateUpdateDto,
  IngredientUpdateRequestDto,
  IngredientResponseDto,
  IngredientQueryParamsDto,
} from './shared/dto';
import {
  UpdateIngredientService,
  UpdateIngredientPayloadMapper,
} from './features/update-ingredient';
import { GetIngredientsService } from './features/get-ingredients';
import { DeleteIngredientService } from './features/delete-ingredient';
import { plainToInstance } from 'class-transformer';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  DuplicateEntryException,
  ForeignKeyViolationException,
} from '../../common/exceptions';
import { IngredientNotFoundException } from './shared/exceptions';
import {
  CreateIngredientPayloadMapper,
  CreateIngredientService,
} from './features/create-ingredient';

@ApiTags('Ingredients')
@ApiBearerAuth()
@Controller('ingredients')
export class IngredientController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(
    private readonly createIngredientService: CreateIngredientService,
    private readonly updateIngredientService: UpdateIngredientService,
    private readonly getIngredientsService: GetIngredientsService,
    private readonly deleteIngredientService: DeleteIngredientService,
  ) {}

  @Get()
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Get all ingredients',
    description:
      'Returns a paginated list of all ingredients with vendor and unit details.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of ingredients',
    type: [IngredientResponseDto],
  })
  async getAll(@Query() query: IngredientQueryParamsDto) {
    try {
      const result = await this.getIngredientsService.getAll(
        query.toQueryParams(),
      );

      return {
        ...result,
        items: plainToInstance(IngredientResponseDto, result.items, {
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
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Get ingredient by ID',
    description: 'Returns a single ingredient with full details.',
  })
  @ApiParam({ name: 'id', description: 'Ingredient ID' })
  @ApiResponse({
    status: 200,
    description: 'Ingredient details',
    type: IngredientResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ingredient not found' })
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    try {
      const ingredient = await this.getIngredientsService.getById(id);
      return plainToInstance(IngredientResponseDto, ingredient, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof IngredientNotFoundException) {
        throw new NotFoundException(e.message);
      }
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
    summary: 'Create a new ingredient',
    description: 'Creates a new ingredient with vendor and unit references.',
  })
  @ApiResponse({
    status: 201,
    description: 'Ingredient created successfully',
    type: IngredientResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() dto: IngredientCreateUpdateDto) {
    try {
      const ingredient = await this.createIngredientService.create(
        CreateIngredientPayloadMapper.fromDto(dto),
      );
      return plainToInstance(IngredientResponseDto, ingredient, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof ForeignKeyViolationException) {
        throw new ConflictException(e.message);
      } else if (e instanceof DuplicateEntryException) {
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
    summary: 'Update an ingredient',
    description: 'Updates an existing ingredient.',
  })
  @ApiParam({ name: 'id', description: 'Ingredient ID' })
  @ApiResponse({
    status: 200,
    description: 'Ingredient updated successfully',
    type: IngredientResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ingredient not found' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: IngredientUpdateRequestDto,
  ) {
    try {
      const ingredient = await this.updateIngredientService.update(
        id,
        UpdateIngredientPayloadMapper.fromDto(dto),
      );
      return plainToInstance(IngredientResponseDto, ingredient, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof IngredientNotFoundException) {
        throw new NotFoundException(e.message);
      } else if (e instanceof ForeignKeyViolationException) {
        throw new ConflictException(e.message);
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
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Delete an ingredient',
    description: 'Permanently deletes an ingredient.',
  })
  @ApiParam({ name: 'id', description: 'Ingredient ID' })
  @ApiResponse({ status: 204, description: 'Ingredient deleted successfully' })
  @ApiResponse({ status: 404, description: 'Ingredient not found' })
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    try {
      await this.deleteIngredientService.delete(id);
      return { message: 'Ingredient deleted successfully' };
    } catch (e) {
      if (e instanceof IngredientNotFoundException) {
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
