import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CategoryPreviewResponseDto {
  @ApiProperty({
    type: String,
    description: 'Category ID',
    example: 'c1a2b3d4-5678-90ab-cdef-1234567890ab',
  })
  @Expose()
  id: string;

  @ApiProperty({
    type: String,
    description: 'Category name',
    example: 'Beverages',
  })
  @Expose()
  name: string;

  @ApiProperty({
    type: String,
    description: 'Category image URL',
    nullable: true,
    example: 'https://example.com/images/beverages.png',
  })
  @Expose()
  imageUrl: string;

  @ApiProperty({
    type: Boolean,
    description: 'Is category active',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Is category active',
    example: true,
  })
  @Expose()
  isDeleted: boolean;

  @ApiProperty({
    type: String,
    description: 'Category slug',
    example: 'beverages',
  })
  @Expose()
  slug: string;

  @ApiProperty({
    type: Date,
    description: 'Deletion date',
    example: '2026-01-24T12:34:56.789Z',
  })
  @Expose()
  deletedAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Creation date',
    example: '2026-01-24T12:34:56.789Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Last updated date',
    example: '2026-01-24T12:34:56.789Z',
  })
  @Expose()
  updatedAt: Date;
}
