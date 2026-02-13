import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class DeleteImagesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids: string[];
}