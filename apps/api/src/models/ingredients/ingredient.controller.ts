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
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { IngredientCreateUpdateDto } from './shared/dto/ingredient-create-update.dto';
import { IngredientUpdateRequestDto } from './shared/dto/ingredient-update-request.dto';
import { IngredientResponseDto } from './shared/dto/ingredient-response.dto';
import { IngredientQueryParamsDto } from './shared/dto/ingredient-query-params.dto';
import { UpdateIngredientService } from './features/update-ingredient/update-ingredient.service';
import { UpdateIngredientPayloadMapper } from './features/update-ingredient/update-ingredient-payload.mapper';
import { GetIngredientsService } from './features/get-ingredients/get-ingredients.service';
import { DeleteIngredientService } from './features/delete-ingredient/delete-ingredient.service';
import { plainToInstance } from 'class-transformer';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CreateIngredientPayloadMapper } from './features/create-ingredient/create-ingredient-payload.mapper';
import { CreateIngredientService } from './features/create-ingredient/create-ingredient.service';

@ApiTags('Ingredients')
@ApiBearerAuth()
@Controller('ingredients')
export class IngredientController {
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
    const result = await this.getIngredientsService.getAll(
      query.toQueryParams(),
    );

    return {
      ...result,
      items: plainToInstance(IngredientResponseDto, result.items, {
        excludeExtraneousValues: true,
      }),
    };
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
    const ingredient = await this.getIngredientsService.getById(id);
    return plainToInstance(IngredientResponseDto, ingredient, {
      excludeExtraneousValues: true,
    });
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
    const ingredient = await this.createIngredientService.create(
      CreateIngredientPayloadMapper.fromDto(dto),
    );
    return plainToInstance(IngredientResponseDto, ingredient, {
      excludeExtraneousValues: true,
    });
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
    const ingredient = await this.updateIngredientService.update(
      id,
      UpdateIngredientPayloadMapper.fromDto(dto),
    );
    return plainToInstance(IngredientResponseDto, ingredient, {
      excludeExtraneousValues: true,
    });
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
    await this.deleteIngredientService.delete(id);
    return { message: 'Ingredient deleted successfully' };
  }
}
