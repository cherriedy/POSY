import { Global, Module } from '@nestjs/common';
import { UnitOfWorkModule } from './unit-of-works/unit-of-work.module';

@Global()
@Module({
  imports: [UnitOfWorkModule],
  exports: [UnitOfWorkModule],
})
export class CommonModule {}
