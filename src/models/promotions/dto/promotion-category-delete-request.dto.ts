import { IsArray, IsString } from "class-validator";

export class BulkDeletePromotionCategoryDto {
  @IsArray()
  @IsString({ each: true })
  categoryIds: string[];
}