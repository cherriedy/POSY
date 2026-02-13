import { FloorPreviewResponseDto } from './floor-preview-response.dto';
import { Exclude } from 'class-transformer';

@Exclude()
export class FloorDetailedResponseDto extends FloorPreviewResponseDto {
  // If there are additional fields for detailed view, add them here
  // Currently floors have the same fields in both preview and detailed views
}
