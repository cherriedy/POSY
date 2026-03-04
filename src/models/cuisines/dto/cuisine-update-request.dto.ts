import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO for updating an existing cuisine.
 *
 * All properties are optional and default to null if not provided.
 */
export class CuisineUpdateRequestDto {
  @ApiPropertyOptional({
    description: 'Name of the cuisine',
    example: 'Vietnamese',
    maxLength: 100,
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string | null = null;

  @ApiPropertyOptional({
    description: 'Geographic or cultural region',
    example: 'Southeast Asia',
    maxLength: 100,
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string | null = null;
}
