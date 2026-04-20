import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class PaymentFailedWebhookDto {
  @ApiProperty({
    description: 'Order id related to failed gateway transaction',
    example: 'f75f5f4c-8f83-41f0-9194-ff6736fb1ec2',
  })
  @IsUUID('all')
  @IsNotEmpty()
  orderId: string;
}
