import { Global, Module } from '@nestjs/common';
import { UnitOfWorkModule } from './unit-of-works';

@Global()
@Module({
  imports: [UnitOfWorkModule],
  exports: [UnitOfWorkModule],
})
export class CommonModule {}
