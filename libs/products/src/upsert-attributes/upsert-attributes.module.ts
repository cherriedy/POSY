import { Module } from '@nestjs/common';
import { UpsertAttributesService } from './upsert-attributes.service';

@Module({
  providers: [UpsertAttributesService],
  exports: [UpsertAttributesService],
})
export class UpsertAttributesModule {}
