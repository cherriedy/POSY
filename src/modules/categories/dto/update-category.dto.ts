export class UpdateCategoryDto {
  id: string;
  name?: { value: string };
  description?: { value: string };
  isActive?: { value: boolean };
}