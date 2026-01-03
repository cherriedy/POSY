import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @GrpcMethod('CategoryService', 'ListCategories')
  async listCategories(data: { pagination?: { page?: number; limit?: number } }) {
    return await this.categoryService.list(data.pagination);
  }

  @GrpcMethod('CategoryService', 'GetCategory')
  async getCategory(data: { id: string }) {
    const category = await this.categoryService.get(data.id);
    return { category };
  }

  @GrpcMethod('CategoryService', 'CreateCategory')
  async createCategory(data: CreateCategoryDto) {
    const category = await this.categoryService.create(data);
    return { category };
  }

  @GrpcMethod('CategoryService', 'UpdateCategory')
  async updateCategory(data: UpdateCategoryDto) {
    const category = await this.categoryService.update(data);
    return { category };
  }

  @GrpcMethod('CategoryService', 'DeleteCategory')
  async deleteCategory(data: { id: string }) {
    return await this.categoryService.delete(data);
  }
}
