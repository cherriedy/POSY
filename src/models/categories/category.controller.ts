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
import { CreateCategoryService } from './features/create-category/create-category.service';
import { UpdateCategoryService } from './features/update-category/update-category.service';
import { DeleteCategoryService } from './features/delete-category/delete-category.service';
import { GetCategoriesService } from './features/get-categories/get-categories.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { Role } from '../../common/enums/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { plainToInstance } from 'class-transformer';
import { CategoryDetailedResponseDto } from './shared/dto/category-detailed-response.dto';
import { CategoryPreviewResponseDto } from './shared/dto/category-preview-response.dto';
import { CategoryQueryParamsDto } from './shared/dto/category-query-params.dto';
import { CreateCategoryDto } from './shared/dto/category-create-request.dto';
import { UpdateCategoryDto } from './shared/dto/category-update-request.dto';
import { Category } from './shared/entities/category';
import { Page } from '../../common/interfaces/page.interface';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { createPageResponseSchema } from '../../common/dto/page-response.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly getCategoriesService: GetCategoriesService,
    private readonly createCategoryService: CreateCategoryService,
    private readonly updateCategoryService: UpdateCategoryService,
    private readonly deleteCategoryService: DeleteCategoryService,
  ) {}

  @Get('available')
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Get available categories',
    description: 'Returns active and non-deleted categories',
  })
  async getAvailableCategories(): Promise<CategoryPreviewResponseDto[]> {
    const categoryPage = await this.getCategoriesService.getAll({
      filter: {
        isActive: true,
        isDeleted: false,
      },
      page: 1,
      pageSize: 1000,
    });

    return plainToInstance(CategoryPreviewResponseDto, categoryPage.items, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Get category by ID',
    description: `Fetches detailed information for a specific category by its unique ID. Accessible by
    MANAGER and ADMIN roles. Returns 400 if the category is not found.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Category details',
    type: CategoryDetailedResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getCategoryById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<CategoryDetailedResponseDto> {
    const category = await this.getCategoriesService.getCategoryById(id);
    return plainToInstance(CategoryDetailedResponseDto, category, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Get all categories',
    description: `Returns a paginated list of all categories. Accessible by MANAGER and ADMIN roles.
    Supports filtering by query parameters such as search query (by name), active status, etc.
    Used for listing and searching categories.`,
  })
  @ApiQuery({ name: 'query', required: false, type: CategoryQueryParamsDto })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of categories',
    schema: createPageResponseSchema(CategoryPreviewResponseDto),
  })
  async getCategories(
    @Query() query: CategoryQueryParamsDto,
  ): Promise<Page<CategoryPreviewResponseDto>> {
    const queryParams = query.toQueryParams();
    const categoryPage = await this.getCategoriesService.getAll(queryParams);

    const categoryPreviewItems = plainToInstance(
      CategoryPreviewResponseDto,
      categoryPage.items,
      { excludeExtraneousValues: true },
    );

    return {
      ...categoryPage,
      items: categoryPreviewItems,
    };
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Create a new category',
    description: `Creates a new category with the provided details. Only accessible by ADMIN
    and MANAGER roles. Returns the created category preview. Throws 400 for duplicate entries
    or related record not found.`,
  })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Category created',
    type: CategoryPreviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Duplicate entry or related record not found',
  })
  async createCategory(@Body() dto: CreateCategoryDto) {
    const category = await this.createCategoryService.createCategory(
      dto as Category,
    );
    return plainToInstance(CategoryPreviewResponseDto, category, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Update a category',
    description: `Updates an existing category by its ID. Only accessible by ADMIN and MANAGER roles.
    Returns the updated category preview. Throws 400 for not found or duplicate entries.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Category updated',
    type: CategoryPreviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Category not found or duplicate entry',
  })
  async updateCategory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const category = await this.updateCategoryService.updateCategoryById(
      id,
      dto as Partial<Category>,
    );
    return plainToInstance(CategoryDetailedResponseDto, category, {
      excludeExtraneousValues: true,
    });
  }

  @Post(':id/toggle-active')
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Toggle category active status',
    description: `Toggles the active status of a category by its ID. Only accessible by ADMIN and
    MANAGER roles. Returns a success message. Throws 400 if the category is not found.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Category active status toggled',
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async toggleCategoryActive(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.updateCategoryService.toggleCategoryActive(id);
    return {
      message: 'Category active status has been successfully toggled.',
    };
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Delete a category',
    description: `Deletes a category by its ID. Only accessible by ADMIN and MANAGER roles.
    Returns a success message. Throws 400 if the category is not found or if it is referenced
    by other records (foreign key violation).`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  @ApiResponse({
    status: 400,
    description: 'Category not found or foreign key violation',
  })
  async deleteCategory(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.deleteCategoryService.deleteCategoryById(id);
    return { message: 'Category has been successfully deleted.' };
  }
}
