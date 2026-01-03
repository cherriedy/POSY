import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService) { }

    private mapCategory(category: any) {
        return {
            id: category.id,
            name: category.name,
            description: category.description ?? '',
            isActive: category.is_active,
            createdAt: category.created_at.toISOString(),
            updatedAt: category.updated_at.toISOString(),
        };
    }

    async list(pagination?: { page?: number; limit?: number }) {
        const page = Math.max(1, pagination?.page ?? 1);
        const limit = Math.min(100, pagination?.limit ?? 10);

        const skip = (page - 1) * limit;

        const [items, total] = await this.prisma.clientInstance.$transaction([
            this.prisma.clientInstance.category.findMany({
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
            }),
            this.prisma.clientInstance.category.count(),
        ]);

        return {
            categories: items.map(c => this.mapCategory(c)),
            page,
            limit,
            total,
        };
    }

    async get(id: string) {
        const category = await this.prisma.clientInstance.category.findUnique({
            where: { id },
        });

        if (!category) {
            throw new Error(`Category with id ${id} not found`);
        }

        return this.mapCategory(category);
    }

    async create(dto: CreateCategoryDto) {
        const data: any = {
            name: dto.name,
            description: dto.description,
        };
        if (dto.isActive !== undefined) {
            data.is_active = dto.isActive.value;
        }
        const category = await this.prisma.clientInstance.category.create({ data });
        return this.mapCategory(category);
    }

    async update(dto: UpdateCategoryDto) {
        const existing = await this.prisma.clientInstance.category.findUnique({
            where: { id: dto.id },
        });

        if (!existing) {
            throw new Error(`Category with id ${dto.id} not found`);
        }

        const data: any = {};

        if (dto.name) data.name = dto.name.value;
        if (dto.description) data.description = dto.description.value;
        if (dto.isActive) data.is_active = dto.isActive.value;

        const updatedCategory = await this.prisma.clientInstance.category.update({
            where: { id: dto.id },
            data,
        });

        return this.mapCategory(updatedCategory);
    }

    async delete(dto: { id: string }) {
        await this.prisma.clientInstance.category.delete({
            where: { id: dto.id },
        });

        return {
            success: true,
            message: 'Category deleted successfully',
        };
    }

}
