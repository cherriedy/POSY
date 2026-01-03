export class CreateCategoryDto {
    name: string;
    description?: string;
    isActive?: { value: boolean };
}