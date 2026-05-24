import { Module } from '@nestjs/common';
import { UnitOfWork } from './unit-of-work.abstract';
import { PrismaUnitOfWork } from './prisma-unit-of-work';

@Module({
  providers: [
    {
      provide: UnitOfWork,
      useClass: PrismaUnitOfWork,
    },
  ],
  exports: [UnitOfWork],
})
export class UnitOfWorkModule {}
