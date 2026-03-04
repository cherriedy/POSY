import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UnitCreateRequestDto {
  @ApiProperty({
    type: String,
    description: 'Unit name',
    example: 'Kilogram',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    type: String,
    description: 'Unit abbreviation',
    example: 'kg',
    maxLength: 10,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  abbreviation: string;
}
