import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { prisma } from './prisma.config';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client = prisma; // dùng instance

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }

  // helper để dùng prisma client ở các service khác
  get clientInstance() {
    return this.client;
  }
}
