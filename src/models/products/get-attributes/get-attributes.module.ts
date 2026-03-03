import { Module } from '@nestjs/common';
import { GetAttributesService } from './get-attributes.service';

@Module({
  providers: [GetAttributesService],
  exports: [GetAttributesService],
})
export class GetAttributesModule {}
