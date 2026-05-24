import { Module } from '@nestjs/common';
import { MeilisearchService } from './meilisearch.service';
import { MeilisearchConfigModule } from '../../config/meilisearch/config.module';

@Module({
  imports: [MeilisearchConfigModule],
  providers: [MeilisearchService],
  exports: [MeilisearchService],
})
export class MeilisearchModule {}
