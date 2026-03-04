import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO for creating a new cuisine.
 */
export class CuisineCreateRequestDto {
  @ApiProperty({
    description: 'Name of the cuisine',
    example: 'Vietnamese',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Geographic or cultural region',
    example: 'Southeast Asia',
    maxLength: 100,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string | null;
}
