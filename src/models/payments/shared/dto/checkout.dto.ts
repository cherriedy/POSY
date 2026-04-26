import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class CheckoutRequestDto {
  @ApiProperty({
    description: 'Order ID to checkout',
    example: 'f75f5f4c-8f83-41f0-9194-ff6736fb1ec2',
  })
  @IsUUID('all')
  orderId: string;

  @ApiProperty({
    description: 'Selected payment method ID',
    example: '6d6d2a9a-69be-4cad-9a2f-68838f17cc19',
  })
  @IsUUID('all')
  methodId: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Optional promotion IDs applied at checkout',
    example: ['3c3e2de8-1f08-49ea-a68b-89f6a2b35f38'],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayUnique()
  @IsOptional()
  promotionIds?: string[];

  @ApiProperty({
    description: 'Platform',
    example: 'app',
  })
  @IsString()
  platform: string;
}
