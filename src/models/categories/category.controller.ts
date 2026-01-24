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
import { CreateCategoryService } from './create-category/create-category.service';
import { UpdateCategoryService } from './update-category/update-category.service';
import { DeleteCategoryService } from './delete-category/delete-category.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { Role } from '../../common/enums';
import { Roles } from '../../common/decorators';
import { GetCategoriesService } from './get-categories/get-categories.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { plainToInstance } from 'class-transformer';
import {
  CategoryDetailedResponseDto,
  CategoryPreviewResponseDto,
  CategoryQueryParamsDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto';
import { Page } from '../../common/interfaces';
import { CategoryNotFoundException } from './exceptions';
import { Category } from './types';
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

@ApiTags('Category')
@ApiBearerAuth()
@Controller('category')
export class CategoryController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(
    private readonly getCategoriesService: GetCategoriesService,
    private readonly createCategoryService: CreateCategoryService,
    private readonly updateCategoryService: UpdateCategoryService,
    private readonly deleteCategoryService: DeleteCategoryService,
  ) {}

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
  @ApiResponse({ status: 400, description: 'Category not found' })
  async getCategoryById(
    @Param('id') id: string,
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
    try {
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
    try {
      const category = await this.createCategoryService.createCategory(
        dto as Category,
      );
      return plainToInstance(CategoryPreviewResponseDto, category, {
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
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    try {
      const category = await this.updateCategoryService.updateCategoryById(
        id,
        dto as Partial<Category>,
      );
      return plainToInstance(CategoryPreviewResponseDto, category, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof CategoryNotFoundException) {
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
  @ApiResponse({ status: 400, description: 'Category not found' })
  async toggleCategoryActive(@Param('id') id: string) {
    try {
      await this.updateCategoryService.toggleCategoryActive(id);
      return {
        message: 'Category active status has been successfully toggled.',
      };
    } catch (e) {
      if (e instanceof CategoryNotFoundException) {
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
  async deleteCategory(@Param('id') id: string) {
    try {
      await this.deleteCategoryService.deleteCategoryById(id);
      return { message: 'Category has been successfully deleted.' };
    } catch (e) {
      if (e instanceof CategoryNotFoundException) {
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
