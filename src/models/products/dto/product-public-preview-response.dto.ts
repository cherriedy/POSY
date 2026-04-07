import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ProductDiscountType } from '../enums';
import { ProductCategoryResponseDto } from './product-category-response.dto';
import { ProductAttributeResponseDto } from './product-attribute-response.dto';

@Exclude()
export class ProductPublicPreviewResponseDto {
  @ApiProperty({ type: String, description: 'Product ID' })
  @Expose()
  id: string;

  @ApiProperty({ type: String, description: 'Product name' })
  @Expose()
  name: string;

  @ApiProperty({ type: String, description: 'URL-friendly product slug' })
  @Expose()
  slug: string;

  @ApiProperty({ type: Number, description: 'Product price' })
  @Expose()
  price: number;

  @ApiProperty({
    enum: ProductDiscountType,
    nullable: true,
    description: 'Discount type applied to this product',
  })
  @Expose()
  discountType: ProductDiscountType;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'Discount amount or percentage',
  })
  @Expose()
  discountValue: number;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Product image URL',
  })
  @Expose()
  imageUrl: string;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the product is available for ordering',
  })
  @Expose()
  isAvailable: boolean;

  @ApiProperty({
    type: () => ProductCategoryResponseDto,
    nullable: true,
    description: 'Category this product belongs to',
  })
  @Expose()
  @Type(() => ProductCategoryResponseDto)
  category: ProductCategoryResponseDto;

  @ApiPropertyOptional({
    type: () => ProductAttributeResponseDto,
    nullable: true,
    description:
      'Taste, dietary, cuisine, and seasonal attributes of the product',
  })
  @Expose()
  @Type(() => ProductAttributeResponseDto)
  attributes: ProductAttributeResponseDto | null;
}
